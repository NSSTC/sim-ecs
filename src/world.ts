import {Entity} from "./entity";
import {EntityBuilder} from "./entity-builder";
import {
    IRunConfiguration,
    IStaticRunConfiguration,
    ISystemActions, ISystemInfo,
    ITransitionActions,
    IWorld,
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
import {System, IISystemProto} from "./system";
import {
    IAccessDescriptor,
    IAccessQuery,
    setEntitiesSym,
    TExistenceQuery,
    Query, clearEntitiesSym
} from "./query/query";

export * from './world.spec';


export interface IWorldConstructorOptions {
    name?: string
    states: TStates
    systems?: Set<ISystemInfo>
    serde?: SerDe
}

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
    protected queries: Query<IAccessQuery<TObjectProto>>[] = [];
    public resources = new Map<{ new(): Object }, Object>();
    protected runExecutionPipeline: Set<System>[] = [];
    protected runExecutionPipelineCache: Map<IIStateProto, Set<System>[]> = new Map();
    protected runPromise?: Promise<void> = undefined;
    protected shouldRunSystems = false;
    protected sortedSystems: Set<ISystemInfo>;
    protected stateInfos: TStates;
    public systemInfos: Set<ISystemInfo>;
    protected systemWorld: ISystemActions;
    protected transitionWorld: ITransitionActions;

    constructor(options: IWorldConstructorOptions) {
        const self = this;

        this._name = options.name;
        this._serde = options.serde ?? new SerDe();
        this.stateInfos = options.states;
        this.systemInfos = options.systems ?? new Set();

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

        this.sortedSystems = this.sortSystems(this.systemInfos);

        for (const systemInfo of this.systemInfos) {
            if (systemInfo.system.query) {
                this.queries.push(systemInfo.system.query);
            }
        }
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
    }

    createEntity(): Entity {
        const entity = new Entity();
        this.entities.add(entity);
        this._dirty = true;
        return entity;
    }

    async dispatch(state?: IIStateProto): Promise<void> {
        await this.run({
            initialState: state,
            afterStepHandler: actions => actions.commands.stopRun(),
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
        const entities = [];
        const groupHandle = intoGroup ?? this.groups.nextHandle++;
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
            this.runExecutionPipeline = [];
            return;
        }

        await newState.activate(this.transitionWorld);
        this.runExecutionPipeline = this.runExecutionPipelineCache.get(newState.constructor as IIStateProto) ?? [];
    }

    // todo: improve logic which sets up the groups (tracked by #13)
    protected prepareExecutionPipeline(state: IState): Set<System>[] {
        // todo: this could be further optimized by allowing systems with dependencies to run in parallel
        //    if all of their dependencies already ran

        // todo: also, if two systems depend on the same components, they may run in parallel
        //    if they only require READ access
        const result: Set<System>[] = [];
        const stateSystems = this.stateInfos.get(state.constructor as IIStateProto) ?? new Set();
        let executionGroup: Set<System> = new Set();
        let shouldRunSystem;
        let systemInfo: ISystemInfo;

        if (this.sortedSystems.size == 0) {
            this.sortSystems(this.systemInfos);
        }

        for (systemInfo of this.sortedSystems) {
            shouldRunSystem = stateSystems.has(systemInfo.system);

            if (shouldRunSystem) {
                if (systemInfo.dependencies.size > 0) {
                    result.push(executionGroup);
                    executionGroup = new Set<System>();
                }

                executionGroup.add(systemInfo.system as System);
            }
        }

        result.push(executionGroup);
        return result;
    }

    async pushState(NewState: IIStateProto): Promise<void> {
        await this.pda.state?.deactivate(this.transitionWorld);
        this.pda.push(NewState);

        const newState = this.pda.state! as State;
        const registeredSystemNames = Array.from(this.systemInfos).map(nfo => nfo.system.constructor.name);

        for (const system of (this.stateInfos.get(newState.constructor as IIStateProto) ?? []).values()) {
            if (!registeredSystemNames.includes(system.constructor.name)) {
                // cannot infer dependencies, so we have to throw :/
                throw new Error(`Did you forget to register System ${system.constructor.name}?`);
            }
        }

        if (this.runExecutionPipelineCache.has(NewState)) {
            this.runExecutionPipeline = this.runExecutionPipelineCache.get(NewState) ?? [];
        } else {
            newState.create(this.transitionWorld);
            this.runExecutionPipeline = this.prepareExecutionPipeline(newState);
            this.runExecutionPipelineCache.set(NewState, this.runExecutionPipeline);
        }

        await newState.activate(this.transitionWorld);
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
            afterStepHandler: configuration.afterStepHandler ?? (_action => {}),
            beforeStepHandler: configuration.beforeStepHandler ?? (_action => {}),
            executionFunction: configuration.executionFunction ?? (typeof requestAnimationFrame == 'function'
                ? requestAnimationFrame
                : setTimeout),
            initialState,
        };

        this.pda.clear();
        this.shouldRunSystems = true;

        for (const systemInfo of this.systemInfos) {
            await systemInfo.system.setup(this.systemWorld);
        }

        await this.pushState(initialState);
        this.runExecutionPipeline = this.prepareExecutionPipeline(this.pda.state! as State);

        this.lastRunPreparation = runConfig;
        return runConfig;
    }

    removeEntity(entity: IEntity): void {
        this.entities.delete(entity);
        this._dirty = true;
    }

    removeEntityFromSystems(entity: IEntity): void {
        this.removeEntity(entity);
        this.maintain();
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

            const afterStepHandler = preparedConfig.afterStepHandler;
            const beforeStepHandler = preparedConfig.beforeStepHandler;
            const execFn = preparedConfig.executionFunction;
            let systemPromises;

            const cleanUp = async () => {
                await this.pda.state?.deactivate(this.transitionWorld);
                for (let state = this.pda.pop(); !!state; state = this.pda.pop()) {
                    await state.destroy(this.transitionWorld);
                }

                for (const systemInfo of this.systemInfos) {
                    await systemInfo.system.destroy(this.systemWorld);
                }

                this.runExecutionPipelineCache.clear();
                this.runPromise = undefined;
                resolver();
            };

            const mainLoop = async () => {
                if (!this.shouldRunSystems) {
                    await cleanUp();
                    return;
                }

                await beforeStepHandler(this.transitionWorld);

                {
                    let executionGroup;
                    let system;
                    for (executionGroup of this.runExecutionPipeline) {
                        systemPromises = [];
                        for (system of executionGroup) {
                            systemPromises.push(system.run(this.systemWorld));
                        }

                        await Promise.all(systemPromises);
                    }
                }

                await afterStepHandler(this.transitionWorld);
                await this._commandsAggregator.executeAll();
                execFn(mainLoop);
            }

            execFn(mainLoop);
        });

        return runPromise;
    }

    protected sortSystems(unsorted: Set<ISystemInfo>): Set<ISystemInfo> {
        const unsortedArr = Array.from(unsorted);
        const graph = new Map(unsortedArr.map(node => [node.system.constructor as IISystemProto, Array.from(node.dependencies)]));
        let edges: IISystemProto[];

        /// toposort with Kahn
        /// https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
        const L: IISystemProto[] = []; // Empty list that will contain the sorted elements
        const S = Array.from(graph.entries()).filter(pair => pair[1].length === 0).map(pair => pair[0]); // Set of all nodes with no incoming edge
        let n: IISystemProto;

        // while S is non-empty do
        while (S.length > 0) {
            // remove a node n from S
            n = S.shift() as IISystemProto;
            // add n to tail of L
            L.push(n);

            // for each node m with an edge e from n to m do
            for (let m of Array.from(graph.entries()).filter(pair => pair[1].includes(n)).map(pair => pair[0])) {
                // remove edge e from the graph
                edges = graph.get(m) as IISystemProto[];
                edges.splice(edges.indexOf(n), 1);

                // if m has no other incoming edges then
                if (edges.length <= 0) {
                    // insert m into S
                    S.push(m);
                }
            }
        }

        if (Array.from(graph.values()).find(n => n.length > 0)) {
            throw new Error('The system dependency graph is cyclic!');
        }

        let obj;
        return new Set(L.map(t => {
            obj = unsortedArr.find(n => n.system.constructor == t);

            if (!obj) {
                throw new Error(`The system ${t.name} was not registered!`);
            }

            return obj;
        }));
    }

    stopRun() {
        this.shouldRunSystems = false;
    }

    save<C extends Object, T extends IAccessDescriptor<C>>(query?: Query<TExistenceQuery<TObjectProto>>, options?: TSerDeOptions<TSerializer>): ISerialFormat {
        return this.serde.serialize({entities: this.getEntities(query)}, options);
    }

    unloadPrefab(handle: TGroupHandle) {
        if (!this.groups.entityLinks.has(handle)) {
            throw new Error(`Could not find any loaded prefab under handle "${handle}"!`)
        }

        let entity;
        for (entity of this.groups.entityLinks.get(handle)!) {
            this.removeEntity(entity);
        }

        this.groups.entityLinks.delete(handle);
    }
}
