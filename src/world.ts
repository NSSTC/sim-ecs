import {Entity} from "./entity";
import {EntityBuilder} from "./entity_builder";
import {ISystemActions, ITransitionActions, IWorld, TRunConfiguration, TSystemInfo, TSystemNode} from "./world.spec";
import IEntity from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem, {access, EAccess, TComponentAccess, TSystemData, TSystemProto} from "./system.spec";
import {IState, State} from "./state";
import {TTypeProto} from "./_.spec";
import {PushDownAutomaton} from "./pda";

export * from './world.spec';

export class World implements IWorld {
    protected dirty = false;
    protected entities: Set<IEntity> = new Set();
    // todo: the pipeline should be compromised of execution groups, which are simpler to handle than checking deps on each node
    protected executionPipeline: TSystemInfo<any>[] = [];
    protected pda = new PushDownAutomaton<IState>();
    protected resources = new Map<{ new(): Object }, Object>();
    protected runPromise?: Promise<void> = undefined;
    protected runSystems: { system: ISystem<any>, hasDependencies: boolean }[] = [];
    protected runSystemsCache: Map<IState, { system: ISystem<any>, hasDependencies: boolean }[]> = new Map();
    protected shouldRunSystems = false;
    protected systemInfos: Map<ISystem<any>, TSystemInfo<any>> = new Map();
    protected systemWorld: ISystemActions;
    protected transitionWorld: ITransitionActions;

    constructor() {
        const self = this;
        this.systemWorld = {
            get currentState(): IState | undefined { return self.pda.state; },
            getEntities: this.getEntities.bind(this),
            getResource: this.getResource.bind(this),
        };

        this.transitionWorld = {
            get currentState(): IState | undefined { return self.pda.state; },
            addEntity: this.addEntity.bind(this),
            addResource: this.addResource.bind(this),
            buildEntity: this.buildEntity.bind(this),
            createEntity: this.createEntity.bind(this),
            getEntities: this.getEntities.bind(this),
            getResource: this.getResource.bind(this),
            maintain: this.maintain.bind(this),
            popState: this.popState.bind(this),
            pushState: this.pushState.bind(this),
            removeEntity: this.removeEntity.bind(this),
            replaceResource: this.replaceResource.bind(this),
            stopRun: this.stopRun.bind(this),
        };
    }

    get systems(): ISystem<any>[] {
        return Array.from(this.systemInfos.keys());
    }

    addEntity(entity: IEntity): IWorld {
        if (!this.entities.has(entity)) {
            this.entities.add(entity);
            this.dirty = true;
        }

        return this;
    }

    addResource<T extends Object>(obj: T | TTypeProto<T>, ...args: any[]): IWorld {
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
        return this;
    }

    addSystem(system: ISystem<any>, dependencies?: TSystemProto<any>[]): IWorld {
        if (Array.from(this.systemInfos.values()).find(info => info.system.constructor == system.constructor)) {
            throw new Error(`The system ${system.constructor.name} is already registered!`);
        }

        this.dirty = true;
        this.systemInfos.set(system, {
            dataPrototype: system.SystemDataType,
            dataSet: new Set(),
            dependencies: new Set(dependencies),
            system: system,
        } as TSystemInfo<any>);

        return this;
    }

    private static buildDataObjects<T extends TSystemData>(dataProto: TTypeProto<TSystemData>, entities: Set<IEntity>): Set<T> {
        const result: Set<T> = new Set();
        let dataObj: T;

        for (const entity of entities) {
            dataObj = new dataProto() as T;
            for (const entry of Object.entries(dataObj)) {
                // @ts-ignore
                dataObj[entry[0]] = entity.getComponent(entry[1][access].component);
            }

            result.add(dataObj);
        }

        return result;
    }

    buildEntity(): IEntityBuilder {
        return new EntityBuilder(this);
    }

    createEntity(): Entity {
        const entity = new Entity();
        this.entities.add(entity);
        return entity;
    }

    async dispatch(state?: IState): Promise<void> {
        if (this.dirty) {
            this.maintain();
        }

        if (!state) {
            state = new State(new Set(this.systemInfos.keys()));
        }

        {
            const stateSystems = Array.from(state.systems);
            let stateSystem;
            let systemInfo: TSystemInfo<any>;
            let parallelRunningSystems = [];
            for (systemInfo of this.executionPipeline) {
                stateSystem = stateSystems.find(stateSys => stateSys.constructor.name === systemInfo.system.constructor.name);
                if (stateSystem) {
                    if (systemInfo.dependencies.size > 0) {
                        await Promise.all(parallelRunningSystems);
                        parallelRunningSystems = [];
                        await systemInfo.system.update(this.systemWorld, systemInfo.dataSet);
                    }
                    else {
                        parallelRunningSystems.push(systemInfo.system.update(this.systemWorld, systemInfo.dataSet))
                    }
                }
            }
        }
    }

    getEntities<C extends Object, T extends TComponentAccess<C>>(query?: T[]): Set<IEntity> {
        if (!query) {
            return this.entities;
        }

        const resultEntities = new Set<IEntity>();

        entityLoop: for (const entity of this.entities) {
            for (let componentRequirement of query) {
                if (
                    (componentRequirement[access].type == EAccess.SET && !entity.hasComponent(componentRequirement[access].component)) ||
                    (componentRequirement[access].type == EAccess.UNSET && entity.hasComponent(componentRequirement[access].component))
                ) continue entityLoop;
            }

            resultEntities.add(entity);
        }

        return resultEntities;
    }

    getResource<T extends Object>(type: TTypeProto<T>): T {
        if (!this.resources.has(type)) {
            throw new Error(`Resource of type "${type.name}" does not exist!`);
        }

        return this.resources.get(type) as T;
    }

    // todo: add parameter which only maintains for a specific state
    maintain(): void {
        this.executionPipeline = this.sortSystems(Array.from(this.systemInfos.values()).map(info => ({
            system: info.system,
            dependencies: Array.from(info.dependencies),
        }))).map(node => this.systemInfos.get(node.system) as TSystemInfo<any>);

        let entity;
        let systemInfo;
        let usableEntities;

        for (systemInfo of this.systemInfos.values()) {
            systemInfo.dataSet.clear();
            usableEntities = new Set<IEntity>();
            for (entity of this.entities) {
                if (systemInfo.system.canUseEntity(entity)) {
                    usableEntities.add(entity);
                }
            }

            systemInfo.dataSet = World.buildDataObjects(systemInfo.dataPrototype, usableEntities);
        }

        this.dirty = false;
    }

    protected async popState(): Promise<void> {
        await this.pda.pop()?.deactivate(this.transitionWorld);
    }

    protected async pushState(newState: IState): Promise<void> {
        const dependencySystems: string[] = [];
        let stateSystem;

        this.pda.push(newState);
        if (this.runSystemsCache.has(newState)) {
            this.runSystems = this.runSystemsCache.get(newState) ?? [];
        }
        else {
            this.runSystems.length = 0;
            for (let system of this.executionPipeline.reverse()) {
                stateSystem = dependencySystems.includes(system.system.constructor.name)
                    ? system.system
                    : Array.from(newState.systems).find(stateSys =>
                        stateSys.constructor.name === system.system.constructor.name);


                if (stateSystem) {
                    this.runSystems.push({
                        system: stateSystem,
                        hasDependencies: system.dependencies.size > 0,
                    });

                    for (const dependency of system.dependencies) {
                        if (!dependencySystems.includes(dependency.name)) {
                            dependencySystems.push(dependency.name);
                        }
                    }
                }
            }

            this.runSystems = this.runSystems.reverse();
            this.runSystemsCache.set(newState, this.runSystems);
        }

        await newState.activate(this.transitionWorld);
    }

    removeEntity(entity: IEntity): void {
        if (this.entities.has(entity)) {
            this.entities.delete(entity);
        }
    }

    replaceResource<T extends Object>(obj: T | TTypeProto<T>, ...args: any[]): IWorld {
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
        return this.addResource(obj, ...args);
    }

    async run(configuration?: TRunConfiguration): Promise<void> {
        // todo: this could be further optimized by allowing systems with dependencies to run in parallel
        //    if all of their dependencies already ran

        // todo: also, if two systems depend on the same components, they may run in parallel
        //    if they only require READ access

        // todo: all states should be prepared (sorted in advance) so that state-changes can happen faster

        if (this.runPromise) {
            throw new Error('The dispatch loop is already running!');
        }

        if (this.dirty) {
            this.maintain();
        }

        let resolver = () => {};

        if (!configuration) {
            configuration = {};
        }

        if (!configuration.initialState) {
            configuration.initialState = new State(new Set(this.systemInfos.keys()));
        }

        this.pda.clear();
        await this.pushState(configuration.initialState);
        this.runPromise = new Promise<void>(res => { resolver = res });
        this.shouldRunSystems = true;

        {
            const execAsync = typeof requestAnimationFrame == 'function'
                ? requestAnimationFrame
                : setTimeout;
            let parallelRunningSystems: Promise<void>[] = [];
            let systemInfo: TSystemInfo<any>;
            const mainLoop = async () => {
                if (!this.shouldRunSystems) {
                    this.runPromise = undefined;
                    resolver();
                    return;
                }

                if (configuration?.transitionHandler) {
                    await configuration?.transitionHandler(this.transitionWorld);
                }

                for (systemInfo of this.executionPipeline) {
                    if (systemInfo.dependencies.size > 0) {
                        await Promise.all(parallelRunningSystems);
                        parallelRunningSystems = [];
                        await systemInfo.system.update(this.systemWorld, systemInfo.dataSet);
                    }
                    else {
                        parallelRunningSystems.push(systemInfo.system.update(this.systemWorld, systemInfo.dataSet))
                    }
                }

                await Promise.all(parallelRunningSystems);
                parallelRunningSystems = [];
                execAsync(mainLoop);
            };

            execAsync(mainLoop);
        }

        return this.runPromise;
    }

    protected sortSystems(unsorted: TSystemNode[]): TSystemNode[] {
        const graph = new Map(unsorted.map(node => [node.system.constructor as TSystemProto<any>, Array.from(node.dependencies)]));
        let edges: TSystemProto<any>[];

        /// toposort with Kahn
        /// https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
        const L: TSystemProto<any>[] = []; // Empty list that will contain the sorted elements
        const S = Array.from(graph.entries()).filter(pair => pair[1].length === 0).map(pair => pair[0]); // Set of all nodes with no incoming edge
        let n: TSystemProto<any>;

        // while S is non-empty do
        while (S.length > 0) {
            // remove a node n from S
            n = S.shift() as TSystemProto<any>;
            // add n to tail of L
            L.push(n);

            // for each node m with an edge e from n to m do
            for (let m of Array.from(graph.entries()).filter(pair => pair[1].includes(n)).map(pair => pair[0])) {
                // remove edge e from the graph
                edges = graph.get(m) as TSystemProto<any>[];
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

    async stopRun(): Promise<void> {
        this.shouldRunSystems = false;
        await this.runPromise;
    }
}
