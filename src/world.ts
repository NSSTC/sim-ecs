import {Entity} from "./entity";
import {EntityBuilder} from "./entity-builder";
import type {
    IRunConfiguration,
    IStaticRunConfiguration,
    IWorld,
    IWorldConstructorOptions,
    TGroupHandle
} from "./world.spec";
import type {IEntity} from "./entity.spec";
import type {IState, IIStateProto} from "./state";
import {State} from "./state";
import type {TExecutor, TObjectProto, TTypeProto} from "./_.spec";
import {PushDownAutomaton} from "./pda";
import type {ISerDe, ISerDeOptions, TDeserializer, TSerializer} from "./serde/serde.spec";
import type {ISerialFormat} from "./serde/serial-format.spec";
import {SerDe} from "./serde/serde";
import {Commands} from "./commands/commands";
import {CommandsAggregator} from "./commands/commands-aggregator";
import type {
    IQuery,
    IEntitiesQuery,
} from "./query/query.spec";
import type {IScheduler} from "./scheduler/scheduler.spec";
import type {IPipeline} from "./scheduler/pipeline/pipeline.spec";
import type {ISystem} from "./system/system.spec";
import {getQueriesFromSystem, getSystemRunParameters} from "./system/system";
import {systemRunParamSym} from "./system/_";
import {clearEntitiesSym, setEntitiesSym} from "./query/_";
import {EventBus} from "./events/event-bus";
import {EventReader} from "./events/event-reader";
import type {IStageAction, ISystemActions, ITransitionActions} from "./world.spec";
import {EntityAdded, EntityRemoved} from "./world/events";

export * from './world.spec';


export class World implements IWorld {
    protected _commandsAggregator: CommandsAggregator;
    protected _commands: Commands;
    protected _dirty = false;
    protected _name?: string;
    protected _serde: ISerDe;
    protected _systemWorld: ISystemActions;
    protected currentScheduler?: IScheduler;
    protected currentSchedulerExecutor?: TExecutor;
    public entities: Set<IEntity> = new Set();
    public readonly eventBus: EventBus = new EventBus();
    protected pda = new PushDownAutomaton<IState>();
    private lastRunPreparation?: IStaticRunConfiguration;
    private groups = {
        nextHandle: 0,
        entityLinks: new Map<number, IEntity[]>(),
    };
    protected queries: Set<IQuery<unknown, unknown>> = new Set();
    public resources = new Map<TObjectProto, Object>();
    protected runPromise?: Promise<void> = undefined;
    protected defaultScheduler: IScheduler;
    protected shouldRunSystems = false;
    protected stateSchedulers: Map<IIStateProto, IScheduler>;
    protected systems = new Set<ISystem>();
    protected transitionWorld: ITransitionActions;

    constructor(options: IWorldConstructorOptions) {
        const self = this;

        this._name = options.name;
        this._serde = options.serde ?? new SerDe();
        this.defaultScheduler = options.defaultScheduler;
        this.stateSchedulers = options.stateSchedulers;

        this._commandsAggregator = new CommandsAggregator(this);
        this._commands = new Commands(this, this._commandsAggregator);

        this._systemWorld = Object.freeze({
            get commands() {
                return self._commands;
            },
            get currentState(): IState | undefined {
                return self.pda.state;
            },
            getEntities: this.getEntities.bind(this),
            getResource: this.getResource.bind(this),
            hasResource: this.hasResource.bind(this),
        });

        this.transitionWorld = Object.freeze({
            get commands() {
                return self._commands;
            },
            get currentState() {
                return self.pda.state;
            },
            get serde() {
                return self.serde;
            },
            flushCommands: this.flushCommands.bind(this),
            getEntities: this.getEntities.bind(this),
            getResource: this.getResource.bind(this),
            getResources: this.getResources.bind(this),
            hasResource: this.hasResource.bind(this),
            maintain: this.maintain.bind(this),
            save: this.save.bind(this),
        });
    }

    get commands() {
        return this._commands;
    }

    get dirty() {
        return this._dirty;
    }

    get name() {
        return this._name;
    }

    get running() {
        return this.shouldRunSystems;
    }

    get serde() {
        return this._serde;
    }

    get systemWorld(): Readonly<ISystemActions> {
        return this._systemWorld;
    }

    addEntity(entity: IEntity) {
        if (!this.entities.has(entity)) {
            this.entities.add(entity);
            // todo: wait for it
            this.eventBus.publish(new EntityAdded(entity));
            this._dirty = true;
        }
    }

    addResource<T extends Object>(obj: T | TTypeProto<T>, ...args: unknown[]) {
        let type: TTypeProto<T>;
        let instance: T;

        if (typeof obj === 'object') {
            type = obj.constructor as TTypeProto<T>;
            instance = obj;
        } else {
            type = obj;
            instance = new (obj.prototype.constructor.bind(obj, ...Array.from(arguments).slice(1)))();
        }

        if (this.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" already exists!`);
        }

        this.resources.set(type, instance);
        return instance;
    }

    buildEntity(uuid?: string): EntityBuilder {
        return new EntityBuilder(uuid, entity => this.addEntity(entity));
    }

    clearEntities() {
        let entity;
        for (entity of this.entities) {
            this.removeEntity(entity);
        }

        this.clearGroups();
    }

    clearGroups() {
        this.groups.entityLinks.clear();
        this.groups.nextHandle = 0;
    }

    clearResources() {
        this.resources.clear();
    }

    createEntity(): Entity {
        const entity = new Entity();
        this.addEntity(entity);
        return entity;
    }

    createGroup(): TGroupHandle {
        const handle = this.groups.nextHandle++;
        this.groups.entityLinks.set(handle, []);
        return handle;
    }

    async dispatch(state?: IIStateProto): Promise<void> {
        await this.run({
            executionFunction: (handler: Function) => {
                handler();
                this.stopRun();
            },
            initialState: state,
        });
    }

    flushCommands() {
        return this._commandsAggregator.executeAll();
    }

    getEntities(query?: IEntitiesQuery): IterableIterator<IEntity> {
        if (!query) {
            return this.entities.keys();
        }

        const resultEntities = new Set<IEntity>();
        let entity;

        for (entity of this.entities.keys()) {
            if (query.matchesEntity(entity)) {
                resultEntities.add(entity);
            }
        }

        return resultEntities.values();
    }

    getResource<T extends Object>(type: TTypeProto<T>): T {
        if (!this.resources.has(type)) {
            throw new Error(`Resource of type "${type.name}" does not exist!`);
        }

        return this.resources.get(type) as T;
    }

    *getResources(types?: TObjectProto[]): IterableIterator<Object> {
        if (!types) {
            return this.resources.values();
        }

        {
            let resource;
            let type;

            for ([type, resource] of this.resources.entries()) {
                if (types.includes(type)) {
                    yield resource;
                }
            }
        }
    }

    getStageWorld(): IStageAction {
        return {
            systems: this.systems,
            systemActions: this._systemWorld,
        };
    }

    hasResource<T extends Object>(obj: T | TTypeProto<T>): boolean {
        let type: TTypeProto<T>;

        if (typeof obj === 'object') {
            type = obj.constructor as TTypeProto<T>;
        } else {
            type = obj;
        }

        return this.resources.has(type);
    }

    load(prefab: ISerialFormat, options?: ISerDeOptions<TDeserializer>, intoGroup?: TGroupHandle): TGroupHandle {
        let groupHandle = intoGroup;
        if (groupHandle == undefined || !this.groups.entityLinks.has(groupHandle)) {
            groupHandle = this.createGroup();
        }

        const serdeOut = this._serde.deserialize(prefab, options);

        {
            const entities = this.groups.entityLinks.get(groupHandle)!;
            let entity: IEntity;

            for (entity of serdeOut.entities) {
                this.addEntity(entity);
                entities.push(entity);
            }
        }

        {
            let resource;

            for (resource of Object.values(serdeOut.resources)) {
                if (options?.replaceResources) {
                    if (this.hasResource(resource)) {
                        this.replaceResource(resource);
                    } else {
                        this.addResource(resource);
                    }
                } else {
                    this.addResource(resource);
                }
            }
        }

        return groupHandle;
    }

    // todo: add parameter which only maintains for a specific state
    // todo: maybe use a change-log to only maintain real changes instead of everything
    maintain(): void {
        let query;
        for (query of this.queries) {
            query[clearEntitiesSym]();
            query[setEntitiesSym](this.entities.values());
        }

        this._dirty = false;
    }

    merge(elsewhere: IWorld, intoGroup?: TGroupHandle): [TGroupHandle, IEntity[]] {
        const groupHandle = intoGroup ?? this.groups.nextHandle++;
        const entities = [];
        let entity;

        for (entity of elsewhere.getEntities()) {
            this.addEntity(entity);
            entities.push(entity);
            elsewhere.removeEntity(entity);
        }

        return [groupHandle, entities];
    }

    async popState(): Promise<void> {
        this.unsubscribeEventsOfSchedulerSystems(this.currentScheduler!);
        await this.pda.pop()?.deactivate(this.transitionWorld);

        const newState = this.pda.state;
        if (!newState) {
            return;
        }

        await newState.activate(this.transitionWorld);
        this.currentScheduler = this.stateSchedulers.get(newState.constructor as IIStateProto) ?? this.defaultScheduler;
        await this.preparePipeline(this.currentScheduler.pipeline);
        this.currentSchedulerExecutor = this.currentScheduler.getExecutor(this);
        this.subscribeEventsOfSchedulerSystems(this.currentScheduler);
    }

    async pushState(NewState: IIStateProto): Promise<void> {
        if (this.currentScheduler) {
            this.unsubscribeEventsOfSchedulerSystems(this.currentScheduler);
        }

        await this.pda.state?.deactivate(this.transitionWorld);
        this.pda.push(NewState);

        const newState = this.pda.state! as State;
        await newState.create(this.transitionWorld);
        await newState.activate(this.transitionWorld);
        await this._commandsAggregator.executeAll();
        this.currentScheduler = this.stateSchedulers.get(NewState) ?? this.defaultScheduler;
        await this.preparePipeline(this.currentScheduler.pipeline);

        if (!this.currentScheduler) {
            throw new Error(`There is no DefaultScheduler or Scheduler for ${NewState.name}!`);
        }

        this.currentSchedulerExecutor = this.currentScheduler.getExecutor(this);
        this.subscribeEventsOfSchedulerSystems(this.currentScheduler);
    }

    protected async preparePipeline(pipeline: IPipeline): Promise<void> {
        let stage;
        let syncPoint;
        let system;
        let queries;

        for (syncPoint of pipeline.getGroups().values()) {
            for (stage of syncPoint.stages) {
                for (system of stage.systems) {
                    if (!system[systemRunParamSym]) {
                        system[systemRunParamSym] = getSystemRunParameters(system, this);
                        await system.setupFunction.call(system, system[systemRunParamSym]!);
                        this.systems.add(system);
                    }

                    queries = getQueriesFromSystem(system);
                    if (queries.length > 0) {
                        this._dirty = true;
                        queries.forEach(q => this.queries.add(q));
                    }
                }
            }
        }
    }

    public async prepareRun(configuration?: IRunConfiguration): Promise<IStaticRunConfiguration> {
        if (this.runPromise) {
            throw new Error('The dispatch loop is already running!');
        }

        configuration ||= {};

        const initialState = configuration.initialState
            ? configuration.initialState
            : State;
        const runConfig: IStaticRunConfiguration = {
            executionFunction: configuration.executionFunction ?? (typeof requestAnimationFrame == 'function'
                ? requestAnimationFrame
                : setTimeout),
            initialState,
        };

        this.pda.clear();
        this.shouldRunSystems = true;

        await this.pushState(initialState);
        await this.preparePipeline(this.stateSchedulers.get(initialState)?.pipeline ?? this.defaultScheduler.pipeline);

        if (this._dirty) {
            this.maintain();
        }

        this.lastRunPreparation = runConfig;
        return runConfig;
    }

    removeEntity(entity: IEntity) {
        this.entities.delete(entity);
        // todo: wait for it
        this.eventBus.publish(new EntityRemoved(entity));
        this._dirty = true;
    }

    removeEntityFromSystems(entity: IEntity) {
        this.removeEntity(entity);
        this.maintain();
    }

    removeGroup(handle: TGroupHandle) {
        if (!this.groups.entityLinks.has(handle)) {
            throw new Error(`Could not find any loaded group under handle "${handle}"!`)
        }

        let entity;
        for (entity of this.groups.entityLinks.get(handle)!) {
            this.removeEntity(entity);
        }

        this.groups.entityLinks.delete(handle);
    }

    replaceEntitiesWith(world: IWorld) {
        this.clearEntities();
        this.merge(world);
    }

    replaceResource<T extends Object>(obj: T | TTypeProto<T>, ...args: unknown[]): void {
        let type: TTypeProto<T>;

        if (typeof obj === 'object') {
            type = obj.constructor as TTypeProto<T>;
        } else {
            type = obj;
        }

        if (!this.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" does not exists!`);
        }

        this.resources.delete(type);
        this.addResource(obj, ...args);
    }

    removeResource<T extends Object>(type: TTypeProto<T>) {
        if (!this.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" does not exists!`);
        }

        this.resources.delete(type);
    }

    run(configuration?: IRunConfiguration, skipPreparation: boolean = false): Promise<void> {
        const runPromise = new Promise<void>(async resolver => {
            let preparedConfig: IStaticRunConfiguration;

            await this._commandsAggregator.executeAll();

            if (!skipPreparation) {
                preparedConfig = await this.prepareRun(configuration);
            }
            else {
                preparedConfig = this.lastRunPreparation!;
            }

            if (!preparedConfig) {
                throw new Error('Cannot run without preparing the run!');
            }

            this.shouldRunSystems = true;
            this.runPromise = runPromise;

            {
                const execFn = preparedConfig.executionFunction;
                this.currentSchedulerExecutor = this.currentScheduler!.getExecutor(this);

                const cleanUp = async () => {
                    await this.pda.state?.deactivate(this.transitionWorld);
                    for (let state = this.pda.pop(); !!state; state = this.pda.pop()) {
                        await state.destroy(this.transitionWorld);
                    }

                    {
                        let syncPoint;
                        for (syncPoint of this.currentScheduler!.pipeline!.getGroups()) {
                            syncPoint.removeOnSyncHandler(syncHandler);
                        }
                    }

                    this.runPromise = undefined;
                    resolver();
                };

                const syncHandler = async () => {
                    try {
                        await this._commandsAggregator.executeAll();
                    } catch (error) {
                        if (typeof error == 'object' && error != null) {
                            await this.eventBus.publish(error);
                        } else {
                            throw error;
                        }
                    }
                }

                const mainLoop = async () => {
                    if (!this.shouldRunSystems) {
                        await cleanUp();
                        return;
                    }

                    try {
                        await this.currentSchedulerExecutor!();
                        await this._commandsAggregator.executeAll();
                    } catch (error) {
                        if (typeof error == 'object' && error != null) {
                            await this.eventBus.publish(error);
                        } else {
                            throw error;
                        }
                    }

                    execFn(mainLoop);
                }

                {
                    let syncPoint;
                    for (syncPoint of this.currentScheduler!.pipeline!.getGroups()) {
                        syncPoint.addOnSyncHandler(syncHandler);
                    }
                }

                execFn(mainLoop);
            }
        });

        return runPromise;
    }

    stopRun() {
        this.shouldRunSystems = false;
    }

    save(options?: ISerDeOptions<TSerializer>): ISerialFormat {
        return this.serde.serialize({
            entities: this.getEntities(options?.entities),
            resources: Object.fromEntries(options?.resources?.map(type => [type.constructor.name, this.getResource(type)!]) ?? []),
        }, options);
    }

    protected subscribeEventsOfSchedulerSystems(scheduler: IScheduler) {
        const systems = scheduler.pipeline.getGroups().map(g => g.stages).flat().map(s => s.systems).flat();
        let system;
        let systemParam;

        for (system of systems) {
            for (systemParam of Object.values(system.parameterDesc)) {
                if (systemParam instanceof EventReader) {
                    this.eventBus.subscribeReader(systemParam);
                }
            }
        }
    }

    protected unsubscribeEventsOfSchedulerSystems(scheduler: IScheduler) {
        const systems = scheduler.pipeline.getGroups().map(g => g.stages).flat().map(s => s.systems).flat();
        let system;
        let systemParam;

        for (system of systems) {
            for (systemParam of Object.values(system.parameterDesc)) {
                if (systemParam instanceof EventReader) {
                    this.eventBus.unsubscribeReader(systemParam);
                }
            }
        }
    }
}
