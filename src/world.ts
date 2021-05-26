import {Entity} from "./entity";
import {EntityBuilder} from "./entity-builder";
import {
    IRunConfiguration,
    IStaticRunConfiguration,
    ISystemActions,
    ITransitionActions,
    IWorld,
    TEntityInfo,
    TGroupHandle,
    TSystemInfo,
    TSystemNode
} from "./world.spec";
import IEntity from "./entity.spec";
import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import {IState, State, TStateProto} from "./state";
import {TTypeProto} from "./_.spec";
import {PushDownAutomaton} from "./pda";
import {access, EAccess, ETargetType, TAccessDescriptor} from "./query.spec";
import {TDeserializer, TSerDeOptions, TSerializer} from "./serde/serde.spec";
import {SerDe} from "./serde/serde";
import {ISerialFormat} from "./serde/serial-format.spec";
import ECS from "./ecs";
import {Commands} from "./commands/commands";
import {CommandsAggregator} from "./commands/commands-aggregator";

export * from './world.spec';

export class World implements IWorld {
    protected _commandsAggregator: CommandsAggregator;
    protected _commands: Commands;
    protected _dirty = false;
    public entityInfos: Map<IEntity, TEntityInfo> = new Map();
    protected pda = new PushDownAutomaton<IState>();
    private lastRunPreparation?: IStaticRunConfiguration;
    public groups = {
        nextHandle: 0,
        entityLinks: new Map<number, IEntity[]>(),
    };
    public resources = new Map<{ new(): Object }, Object>();
    protected runExecutionPipeline: Set<TSystemInfo<TSystemData>>[] = [];
    protected runExecutionPipelineCache: Map<TStateProto, Set<TSystemInfo<TSystemData>>[]> = new Map();
    protected runPromise?: Promise<void> = undefined;
    protected shouldRunSystems = false;
    protected sortedSystems: TSystemInfo<TSystemData>[];
    protected systemWorld: ISystemActions;
    protected transitionWorld: ITransitionActions;

    constructor(
        public ecs: ECS,
        protected systemInfos: Map<ISystem<TSystemData>, TSystemInfo<TSystemData>>,
        protected _serde: SerDe = new SerDe(),
    ) {
        const self = this;

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
            buildEntity: this.buildEntity.bind(this),
            flushCommands: this.flushCommands.bind(this),
            getEntities: this.getEntities.bind(this),
            getResource: this.getResource.bind(this),
            getResources: this.getResources.bind(this),
            maintain: this.maintain.bind(this),
            save: this.save.bind(this),
        });

        for (const system of systemInfos.keys()) {
            this.addResource(system);
        }

        this.sortedSystems = this.sortSystems(Array.from(this.systemInfos.values()).map(info => ({
            system: info.system,
            dependencies: Array.from(info.dependencies),
        }))).map(node => this.systemInfos.get(node.system) as TSystemInfo<TSystemData>);
    }

    get commands() {
        return this._commands;
    }

    get dirty() {
        return this._dirty;
    }

    get running() {
        return this.shouldRunSystems;
    }

    get serde() {
        return this._serde;
    }

    get systems(): ISystem<TSystemData>[] {
        return Array.from(this.systemInfos.keys());
    }

    addEntity(entity: IEntity) {
        if (!this.entityInfos.has(entity)) {
            this.entityInfos.set(entity, {
                entity,
                usage: new Map(),
            });
            this._dirty = true;

            entity.changeWorldTo(this);
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

    private static assignEntityToSystem(systemInfo: TSystemInfo<TSystemData>, entityInfo: TEntityInfo): boolean {
        if (!systemInfo.system.canUseEntity(entityInfo.entity)) return false;

        const data = World.buildDataObject(systemInfo.dataPrototype, entityInfo.entity);

        systemInfo.dataSet.add(data);
        entityInfo.usage.set(systemInfo, data);
        return true;
    }

    assignEntityToSystems(entity: IEntity) {
        const entityInfo = this.entityInfos.get(entity);
        if (!entityInfo) return;

        let systemInfo;
        for (systemInfo of this.systemInfos.values()) {
            World.assignEntityToSystem(systemInfo, entityInfo);
        }
    }

    private static buildDataObject<T extends TSystemData>(dataProto: TTypeProto<TSystemData>, entity: IEntity): T {
        const dataObj = new dataProto() as T;
        let accessType: EAccess;
        let target;
        let targetType;

        for (const entry of Object.entries(dataObj)) {
            // @ts-ignore
            accessType = entry[1][access].type;
            // @ts-ignore
            target = entry[1][access].target;
            // @ts-ignore
            targetType = entry[1][access].targetType;

            if (accessType == EAccess.meta) {
                switch (target) {
                    case Entity: {
                        // @ts-ignore
                        dataObj[entry[0]] = entity;
                        break;
                    }
                }
            } else if (targetType == ETargetType.component) {
                // @ts-ignore
                dataObj[entry[0]] = entity.getComponent(target);
            }
        }

        return dataObj;
    }

    buildEntity(): EntityBuilder {
        return new EntityBuilder();
    }

    clearEntities() {
        this.entityInfos.clear();
    }

    createEntity(): Entity {
        const entity = new Entity();
        this.entityInfos.set(entity, {
            entity,
            usage: new Map(),
        });
        return entity;
    }

    async dispatch(state?: TStateProto): Promise<void> {

        await this.run({
            initialState: state,
            afterStepHandler: actions => actions.commands.stopRun(),
        });
    }

    flushCommands() {
        return this._commandsAggregator.executeAll();
    }

    getEntities<C extends Object, T extends TAccessDescriptor<C>>(query?: T[]): IterableIterator<IEntity> {
        if (!query) {
            return this.entityInfos.keys();
        }

        const resultEntities = new Set<IEntity>();
        let entityInfo;

        for (entityInfo of this.entityInfos.values()) {
            if (entityInfo.entity.matchesQueue(query)) {
                resultEntities.add(entityInfo.entity);
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
        let entity;

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
        let entityInfo;
        let systemInfo;

        for (systemInfo of this.systemInfos.values()) {
            systemInfo.dataSet.clear();
            for (entityInfo of this.entityInfos.values()) {
                World.assignEntityToSystem(systemInfo, entityInfo);
            }
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
        this.runExecutionPipeline = this.runExecutionPipelineCache.get(newState.constructor as TStateProto) ?? [];
    }

    // todo: improve logic which sets up the groups (tracked by #13)
    protected prepareExecutionPipeline(state: IState): Set<TSystemInfo<TSystemData>>[] {
        // todo: this could be further optimized by allowing systems with dependencies to run in parallel
        //    if all of their dependencies already ran

        // todo: also, if two systems depend on the same components, they may run in parallel
        //    if they only require READ access
        const result: Set<TSystemInfo<TSystemData>>[] = [];
        const stateSystems = state.systems;
        let executionGroup: Set<TSystemInfo<TSystemData>> = new Set();
        let shouldRunSystem;
        let systemInfo: TSystemInfo<TSystemData>;

        // todo: system-sorting should not depend on entity-sorting!
        if (this._dirty) {
            // this line is purely to satisfy my IDE
            this.sortedSystems = [];
            this.maintain();
        }

        for (systemInfo of this.sortedSystems) {
            shouldRunSystem = !!stateSystems.find(stateSys => stateSys.prototype.constructor.name === systemInfo.system.constructor.name);

            if (shouldRunSystem) {
                if (systemInfo.dependencies.size > 0) {
                    result.push(executionGroup);
                    executionGroup = new Set<TSystemInfo<TSystemData>>();
                }

                executionGroup.add(systemInfo);
            }
        }

        result.push(executionGroup);
        return result;
    }

    async pushState(NewState: TStateProto): Promise<void> {
        await this.pda.state?.deactivate(this.transitionWorld);
        this.pda.push(NewState);

        const newState = this.pda.state!;
        const registeredSystemNames = Array.from(this.systemInfos.keys()).map(nfo => nfo.constructor.name);

        for (const system of newState.systems) {
            if (!registeredSystemNames.includes(system.name)) {
                // cannot infer dependencies, so we have to throw :/
                throw new Error(`Did you forget to register System ${system.name}?`);
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
            : State.bind(undefined, Array.from(this.systemInfos.keys()).map(system => system.constructor as TSystemProto<TSystemData>));
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

        for (const system of this.systemInfos.keys()) {
            await system.setup(this.systemWorld);
        }

        await this.pushState(initialState);
        this.runExecutionPipeline = this.prepareExecutionPipeline(this.pda.state!);

        this.lastRunPreparation = runConfig;
        return runConfig;
    }

    removeEntity(entity: IEntity): void {
        if (this.entityInfos.has(entity)) {
            this.entityInfos.delete(entity);
            entity.changeWorldTo(undefined);
        }
    }

    removeEntityFromSystems(entity: IEntity): void {
        const usage = this.entityInfos.get(entity)?.usage;
        if (!usage) return;

        let use;
        for (use of usage.values()) {
            for (const info of this.systemInfos.values()) {
                if (info.dataSet.has(use)) {
                    info.dataSet.delete(use);
                }
            }
        }
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

            this.runPromise = runPromise;

            const afterStepHandler = preparedConfig.afterStepHandler;
            const beforeStepHandler = preparedConfig.beforeStepHandler;
            const execFn = preparedConfig.executionFunction;
            let executionGroup;
            let systemInfo;
            let systemPromises;

            const cleanUp = async () => {
                await this.pda.state?.deactivate(this.transitionWorld);
                for (let state = this.pda.pop(); !!state; state = this.pda.pop()) {
                    await state.destroy(this.transitionWorld);
                }

                for (const system of this.systemInfos.keys()) {
                    await system.destroy(this.systemWorld);
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

                for (executionGroup of this.runExecutionPipeline) {
                    systemPromises = [];
                    for (systemInfo of executionGroup) {
                        systemPromises.push(systemInfo.system.run(systemInfo.dataSet));
                    }

                    await Promise.all(systemPromises);
                }

                await afterStepHandler(this.transitionWorld);
                await this._commandsAggregator.executeAll();
                execFn(mainLoop);
            }

            execFn(mainLoop);
        });

        return runPromise;
    }

    protected sortSystems(unsorted: TSystemNode[]): TSystemNode[] {
        const graph = new Map(unsorted.map(node => [node.system.constructor as TSystemProto<TSystemData>, Array.from(node.dependencies)]));
        let edges: TSystemProto<TSystemData>[];

        /// toposort with Kahn
        /// https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
        const L: TSystemProto<TSystemData>[] = []; // Empty list that will contain the sorted elements
        const S = Array.from(graph.entries()).filter(pair => pair[1].length === 0).map(pair => pair[0]); // Set of all nodes with no incoming edge
        let n: TSystemProto<TSystemData>;

        // while S is non-empty do
        while (S.length > 0) {
            // remove a node n from S
            n = S.shift() as TSystemProto<TSystemData>;
            // add n to tail of L
            L.push(n);

            // for each node m with an edge e from n to m do
            for (let m of Array.from(graph.entries()).filter(pair => pair[1].includes(n)).map(pair => pair[0])) {
                // remove edge e from the graph
                edges = graph.get(m) as TSystemProto<TSystemData>[];
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
        return L.map(t => {
            obj = unsorted.find(n => n.system.constructor == t);

            if (!obj) {
                throw new Error(`The system ${t.name} was not registered!`);
            }

            return obj;
        });
    }

    stopRun() {
        this.shouldRunSystems = false;
    }

    save<C extends Object, T extends TAccessDescriptor<C>>(query?: T[], options?: TSerDeOptions<TSerializer>): ISerialFormat {
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
