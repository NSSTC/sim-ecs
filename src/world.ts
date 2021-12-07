import {Entity} from "./entity";
import {EntityBuilder} from "./entity-builder";
import {
    IRunConfiguration,
    IStaticRunConfiguration,
    ISystemActions,
    ITransitionActions,
    IWorld, IWorldConstructorOptions,
    TGroupHandle, TStates
} from "./world.spec";
import {IEntity} from "./entity.spec";
import {IState, State, IIStateProto} from "./state";
import {TObjectProto, TTypeProto} from "./_.spec";
import {PushDownAutomaton} from "./pda";
import {SerDe, TDeserializer, TSerDeOptions, TSerializer} from "./serde/serde";
import {ISerialFormat} from "./serde/serial-format";
import {Commands} from "./commands/commands";
import {CommandsAggregator} from "./commands/commands-aggregator";
import {
    IAccessDescriptor,
    IAccessQuery,
    setEntitiesSym,
    TExistenceQuery,
    Query, clearEntitiesSym
} from "./query/query";
import {IScheduler} from "./scheduler/scheduler.spec";
import {IPipeline} from "./scheduler/pipeline/pipeline.spec";

export * from './world.spec';


export class World implements IWorld {
    protected _commandsAggregator: CommandsAggregator;
    protected _commands: Commands;
    protected _dirty = false;
    protected _name?: string;
    protected _serde: SerDe;
    public entities: Set<IEntity> = new Set();
    protected pda = new PushDownAutomaton<IState>();
    private lastRunPreparation?: IStaticRunConfiguration;
    public groups = {
        nextHandle: 0,
        entityLinks: new Map<number, IEntity[]>(),
    };
    protected queries: Set<Query<IAccessQuery<TObjectProto>>> = new Set();
    public resources = new Map<{ new(): Object }, Object>();
    protected runPromise?: Promise<void> = undefined;
    protected scheduler: IScheduler;
    protected shouldRunSystems = false;
    protected stateInfos: TStates;
    protected systemWorld: ISystemActions;
    protected transitionWorld: ITransitionActions;

    constructor(options: IWorldConstructorOptions) {
        const self = this;

        this._name = options.name;
        this._serde = options.serde ?? new SerDe();
        this.stateInfos = options.states;
        this.scheduler = options.scheduler;

        this._commandsAggregator = new CommandsAggregator(this);
        this._commands = new Commands(this, this._commandsAggregator);

        this.systemWorld = Object.freeze({
            get commands() {
                return self._commands;
            },
            get currentState(): IState | undefined {
                return self.pda.state;
            },
            getEntities: this.getEntities.bind(this),
            getResource: this.getResource.bind(this),
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
            maintain: this.maintain.bind(this),
            save: this.save.bind(this),
        });

        this.preparePipeline(this.scheduler.currentPipeline);
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

    addEntity(entity: IEntity) {
        if (!this.entities.has(entity)) {
            this.entities.add(entity);
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
        this.entities.clear();
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
        this.entities.add(entity);
        this._dirty = true;
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

    getEntities(query?: Query<IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>>): IterableIterator<IEntity> {
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

    getResources(): IterableIterator<unknown> {
        return this.resources.values();
    }

    load(prefab: ISerialFormat, options?: TSerDeOptions<TDeserializer>, intoGroup?: TGroupHandle): TGroupHandle {
        let groupHandle = intoGroup;
        if (groupHandle == undefined || !this.groups.entityLinks.has(groupHandle)) {
            groupHandle = this.createGroup();
        }

        const entities = this.groups.entityLinks.get(groupHandle)!;
        let entity: IEntity;

        for (entity of this._serde.deserialize(prefab, options).entities) {
            this.addEntity(entity);
            entities.push(entity);
        }

        this.groups.entityLinks.set(groupHandle, entities);
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
        await this.pda.pop()?.deactivate(this.transitionWorld);

        const newState = this.pda.state;
        if (!newState) {
            return;
        }

        await newState.activate(this.transitionWorld);
    }

    async pushState(NewState: IIStateProto): Promise<void> {
        await this.pda.state?.deactivate(this.transitionWorld);
        this.pda.push(NewState);

        const newState = this.pda.state! as State;

        // todo: call create if new!
        // newState.create(this.transitionWorld);

        await newState.activate(this.transitionWorld);
    }

    protected preparePipeline(pipeline: IPipeline): void {
        let stage;
        let syncPoint;
        let system;

        for (syncPoint of pipeline.getGroups().values()) {
            for (stage of syncPoint.stages) {
                for (system of stage.systems) {
                    system.setup(this.systemWorld);

                    if (system.query) {
                        this.queries.add(system.query);
                    }
                }
            }
        }
    }

    public async prepareRun(configuration?: IRunConfiguration): Promise<IStaticRunConfiguration> {
        if (this.runPromise) {
            throw new Error('The dispatch loop is already running!');
        }

        if (this._dirty) {
            this.maintain();
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

        this.lastRunPreparation = runConfig;
        return runConfig;
    }

    removeEntity(entity: IEntity) {
        this.entities.delete(entity);
        this._dirty = true;
    }

    removeEntityFromSystems(entity: IEntity) {
        this.removeEntity(entity);
        this.maintain();
    }

    removeGroup(handle: TGroupHandle) {
        if (!this.groups.entityLinks.has(handle)) {
            throw new Error(`Could not find any loaded prefab under handle "${handle}"!`)
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

    replaceResource<T extends Object>(obj: T | TTypeProto<T>, ...args: unknown[]) {
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

                const cleanUp = async () => {
                    await this.pda.state?.deactivate(this.transitionWorld);
                    for (let state = this.pda.pop(); !!state; state = this.pda.pop()) {
                        await state.destroy(this.transitionWorld);
                    }

                    this.runPromise = undefined;
                    resolver();
                };

                const mainLoop = async () => {
                    if (!this.shouldRunSystems) {
                        await cleanUp();
                        return;
                    }

                    await this.scheduler.execute(this.systemWorld);
                    await this._commandsAggregator.executeAll();
                    execFn(mainLoop);
                }

                execFn(mainLoop);
            }
        });

        return runPromise;
    }

    stopRun() {
        this.shouldRunSystems = false;
    }

    save<C extends Object, T extends IAccessDescriptor<C>>(query?: Query<TExistenceQuery<TObjectProto>>, options?: TSerDeOptions<TSerializer>): ISerialFormat {
        return this.serde.serialize({entities: this.getEntities(query)}, options);
    }
}
