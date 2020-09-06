import {Entity} from "./entity";
import {EntityBuilder} from "./entity-builder";
import {
    IEntityWorld, IPartialWorld,
    ISystemActions,
    ITransitionActions,
    IWorld,
    TEntityInfo,
    TRunConfiguration,
    TStaticRunConfiguration,
    TSystemInfo,
    TSystemNode
} from "./world.spec";
import IEntity from "./entity.spec";
import IEntityBuilder from "./entity-builder.spec";
import ISystem, {access, EAccess, TComponentAccess, TSystemData, TSystemProto} from "./system.spec";
import {IState, State} from "./state";
import {TTypeProto} from "./_.spec";
import {PushDownAutomaton} from "./pda";
import {SaveFormat} from "./save-format";
import {TDeserializer} from "./save-format.spec";

export * from './world.spec';

export class World implements IWorld {
    protected dirty = false;
    protected entityInfos: Map<IEntity, TEntityInfo> = new Map();
    protected entityWorld: IEntityWorld;
    protected pda = new PushDownAutomaton<IState>();
    protected resources = new Map<{ new(): Object }, Object>();
    protected runExecutionPipeline: Set<TSystemInfo<TSystemData>>[] = [];
    protected runExecutionPipelineCache: Map<IState, Set<TSystemInfo<TSystemData>>[]> = new Map();
    protected runPromise?: Promise<void> = undefined;
    protected shouldRunSystems = false;
    protected sortedSystems: TSystemInfo<TSystemData>[];
    protected systemInfos: Map<ISystem<TSystemData>, TSystemInfo<TSystemData>>;
    protected systemWorld: ISystemActions;
    protected transitionWorld: ITransitionActions;

    static fromJSON(json: string, deserializer: TDeserializer): World {
        const save = SaveFormat.fromJSON(json);
        const newWorld = new World(new Map());
        let entity;

        for (entity of save.getEntities(deserializer)) {
            newWorld.addEntity(entity);
        }

        return newWorld;
    }

    constructor(systemInfos: Map<ISystem<TSystemData>, TSystemInfo<TSystemData>>) {
        const self = this;

        this.systemWorld = Object.freeze({
            get currentState(): IState | undefined { return self.pda.state; },
            getEntities: this.getEntities.bind(this),
            getResource: this.getResource.bind(this),
        });

        this.transitionWorld = Object.freeze({
            get currentState(): IState | undefined { return self.pda.state; },
            addEntity: (entity) => { self.addEntity(entity); self.assignEntityToSystems(entity); },
            addResource: this.addResource.bind(this),
            buildEntity: () => this.buildEntity.call(this, this.transitionWorld),
            createEntity: this.createEntity.bind(this),
            getEntities: this.getEntities.bind(this),
            getResource: this.getResource.bind(this),
            maintain: this.maintain.bind(this),
            merge: this.merge.bind(this),
            popState: this.popState.bind(this),
            pushState: this.pushState.bind(this),
            removeEntity: (entity) => {
                this.removeEntityFromSystems(entity);
                this.removeEntity(entity); },
            removeResource: this.removeResource.bind(this),
            replaceResource: this.replaceResource.bind(this),
            stopRun: this.stopRun.bind(this),
            toJSON: this.toJSON.bind(this),
        });

        this.entityWorld = Object.freeze({
            get isDirty(): boolean { return self.dirty; },
            get isRunning(): boolean { return !!self.runPromise; },
            addEntity: this.addEntity.bind(this),
            addResource: this.addResource.bind(this),
            assignEntityToSystems: this.assignEntityToSystems.bind(this),
            buildEntity: () => this.buildEntity.call(this, this.transitionWorld),
            createEntity: this.createEntity.bind(this),
            getEntities: this.getEntities.bind(this),
            getResource: this.getResource.bind(this),
            maintain: this.maintain.bind(this),
            merge: this.merge.bind(this),
            removeEntity: this.removeEntity.bind(this),
            removeEntityFromSystems: this.removeEntityFromSystems.bind(this),
            removeResource: this.removeResource.bind(this),
            replaceResource: this.replaceResource.bind(this),
            stopRun: this.stopRun.bind(this),
            toJSON: this.toJSON.bind(this),
        });

        for (const system of systemInfos.keys()) {
            this.addResource(system);
        }

        this.systemInfos = systemInfos;
        this.sortedSystems = this.sortSystems(Array.from(this.systemInfos.values()).map(info => ({
            system: info.system,
            dependencies: Array.from(info.dependencies),
        }))).map(node => this.systemInfos.get(node.system) as TSystemInfo<TSystemData>);
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
            this.dirty = true;

            entity.changeWorldTo(this.entityWorld);
        }
    }

    addResource<T extends Object>(obj: T | TTypeProto<T>, ...args: unknown[]) {
        let type: TTypeProto<T>;
        let instance: T;

        if (typeof obj === 'object') {
            type = obj.constructor as TTypeProto<T>;
            instance = obj;
        }
        else {
            type = obj;
            instance = new (obj.prototype.constructor.bind(obj, ...Array.from(arguments).slice(1)))();
        }

        if (this.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" already exists!`);
        }

        this.resources.set(type, instance);
    }

    private static assignEntityToSystem(systemInfo: TSystemInfo<TSystemData>, entityInfo: TEntityInfo): boolean {
        if (!systemInfo.system.canUseEntity(entityInfo.entity)) return false;

        const data = World.buildDataObject(systemInfo.dataPrototype, entityInfo.entity);

        systemInfo.dataSet.add(data);
        entityInfo.usage.set(systemInfo, data);
        return true;
    }

    private assignEntityToSystems(entity: IEntity) {
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
        let component;

        for (const entry of Object.entries(dataObj)) {
            // @ts-ignore
            accessType = entry[1][access].type;
            // @ts-ignore
            component = entry[1][access].component;

            if (accessType == EAccess.META) {
                switch (component) {
                    case Entity: {
                        // @ts-ignore
                        dataObj[entry[0]] = entity;
                        break;
                    }
                }
            }
            else {
                // @ts-ignore
                dataObj[entry[0]] = entity.getComponent(component);
            }
        }

        return dataObj;
    }

    buildEntity(world?: IPartialWorld): IEntityBuilder {
        return new EntityBuilder(world ?? this);
    }

    createEntity(): Entity {
        const entity = new Entity();
        this.entityInfos.set(entity, {
            entity,
            usage: new Map(),
        });
        return entity;
    }

    dispatch(state?: IState): Promise<void> {
        return this.run({
            initialState: state,
            transitionHandler: async actions => { actions.stopRun() },
        });
    }

    getEntities<C extends Object, T extends TComponentAccess<C>>(query?: T[]): IterableIterator<IEntity> {
        if (!query) {
            return this.entityInfos.keys();
        }

        const resultEntities = new Set<IEntity>();
        let entityInfo;

        entityLoop: for (entityInfo of this.entityInfos.values()) {
            for (let componentRequirement of query) {
                if (
                    (componentRequirement[access].type == EAccess.SET && !entityInfo.entity.hasComponent(componentRequirement[access].component)) ||
                    (componentRequirement[access].type == EAccess.UNSET && entityInfo.entity.hasComponent(componentRequirement[access].component))
                ) continue entityLoop;
            }

            resultEntities.add(entityInfo.entity);
        }

        return resultEntities.values();
    }

    getResource<T extends Object>(type: TTypeProto<T>): T {
        if (!this.resources.has(type)) {
            throw new Error(`Resource of type "${type.name}" does not exist!`);
        }

        return this.resources.get(type) as T;
    }

    // todo: add parameter which only maintains for a specific state
    maintain(): void {
        let entityInfo;
        let systemInfo;
        let usableEntities;

        for (systemInfo of this.systemInfos.values()) {
            systemInfo.dataSet.clear();
            usableEntities = new Set<IEntity>();
            for (entityInfo of this.entityInfos.values()) {
                World.assignEntityToSystem(systemInfo, entityInfo);
            }
        }

        this.dirty = false;
    }

    merge(elsewhere: IWorld) {
        let entity;
        for (entity of elsewhere.getEntities()) {
            this.addEntity(entity);
        }
    }

    protected async popState(): Promise<void> {
        await this.pda.pop()?.deactivate(this.transitionWorld);
        await this.pda.state?.activate(this.transitionWorld);
    }

    // todo: improve logic which sets up the groups (tracked by #13)
    protected prepareExecutionPipeline(state: IState): Set<TSystemInfo<TSystemData>>[] {
        // todo: this could be further optimized by allowing systems with dependencies to run in parallel
        //    if all of their dependencies already ran

        // todo: also, if two systems depend on the same components, they may run in parallel
        //    if they only require READ access
        const result: Set<TSystemInfo<TSystemData>>[] = [];
        const stateSystems = Array.from(state.systems);
        let executionGroup: Set<TSystemInfo<TSystemData>> = new Set();
        let shouldRunSystem;
        let systemInfo: TSystemInfo<TSystemData>;

        if (this.dirty) {
            // this line is purely to satisfy my IDE
            this.sortedSystems = [];
            this.maintain();
        }

        for (systemInfo of this.sortedSystems) {
            shouldRunSystem = !!stateSystems.find(stateSys => stateSys.constructor.name === systemInfo.system.constructor.name);

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

    protected async pushState(newState: IState): Promise<void> {
        await this.pda.state?.deactivate(this.transitionWorld);
        this.pda.push(newState);
        if (this.runExecutionPipelineCache.has(newState)) {
            this.runExecutionPipeline = this.runExecutionPipelineCache.get(newState) ?? [];
        }
        else {
            newState.create(this.transitionWorld);
            this.runExecutionPipeline = this.prepareExecutionPipeline(newState);
            this.runExecutionPipelineCache.set(newState, this.runExecutionPipeline);
        }

        await newState.activate(this.transitionWorld);
    }

    removeEntity(entity: IEntity): void {
        if (this.entityInfos.has(entity)) {
            this.entityInfos.delete(entity);
            entity.changeWorldTo(undefined);
        }
    }

    private removeEntityFromSystems(entity: IEntity): void {
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

    replaceResource<T extends Object>(obj: T | TTypeProto<T>, ...args: unknown[]) {
        let type: TTypeProto<T>;

        if (typeof obj === 'object') {
            type = obj.constructor as TTypeProto<T>;
        }
        else {
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

    run(configuration?: TRunConfiguration): Promise<void> {
        if (this.runPromise) {
            throw new Error('The dispatch loop is already running!');
        }

        if (this.dirty) {
            this.maintain();
        }

        configuration ||= {};
        configuration.initialState ||= new State(new Set(this.systemInfos.keys()));

        const initialState = configuration.initialState;
        const runConfig: TStaticRunConfiguration = {
            initialState,
            transitionHandler: configuration.transitionHandler ?? (async _action => {}),
        };

        this.pda.clear();
        this.shouldRunSystems = true;

        for (const system of this.systemInfos.keys()) {
            system.setup(this.systemWorld);
        }

        this.runPromise = new Promise(async resolver => {
            await this.pushState(initialState);

            const execAsync = typeof requestAnimationFrame == 'function'
                ? requestAnimationFrame
                : setTimeout;
            let executionGroup;
            this.runExecutionPipeline = this.prepareExecutionPipeline(this.pda.state ?? initialState);
            let systemInfo;
            let systemPromises;

            const cleanUp = async () => {
                await this.pda.state?.deactivate(this.transitionWorld);
                for (const state of this.runExecutionPipelineCache.keys()) {
                    await state.destroy(this.transitionWorld);
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

                for (executionGroup of this.runExecutionPipeline) {
                    systemPromises = [];
                    for (systemInfo of executionGroup) {
                        systemPromises.push(systemInfo.system.run(systemInfo.dataSet));
                    }

                    await Promise.all(systemPromises);
                }

                await runConfig.transitionHandler(this.transitionWorld);
                execAsync(mainLoop);
            }

            execAsync(mainLoop);
        });

        return this.runPromise;
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

    toJSON(): string {
        const save = new SaveFormat({
            entities: this.entityInfos.keys(),
        });

        return save.toJSON();
    }
}
