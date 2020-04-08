import {Entity} from "./entity";
import {EntityBuilder} from "./entity_builder";
import {ISystemWorld, ITransitionWorld, IWorld, TRunConfiguration, TSystemNode} from "./world.spec";
import IEntity from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem, {access, EAccess, TComponentAccess, TSystemData, TSystemProto} from "./system.spec";
import {IState, State} from "./state";
import {TTypeProto} from "./_.spec";
import {PushDownAutomaton} from "./pda";

export * from './world.spec';

export class World implements IWorld {
    protected defaultState = new State();
    protected entities: IEntity[] = [];
    protected pda = new PushDownAutomaton<IState>();
    protected resources = new Map<{ new(): Object }, Object>();
    protected runPromise?: Promise<void> = undefined;
    protected runSystems: { system: ISystem<any>, hasDependencies: boolean }[] = [];
    protected runSystemsCache: Map<IState, { system: ISystem<any>, hasDependencies: boolean }[]> = new Map();
    protected shouldRunSystems = false;
    protected sortedSystems: TSystemNode[] = [];
    protected systemWorld: ISystemWorld;
    protected transitionWorld: ITransitionWorld;

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
        return this.defaultState.systems;
    }

    addEntity(entity: IEntity): IWorld {
        if (!this.entities.includes(entity)) {
            entity.setWorld(this);
            this.entities.push(entity);
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

    private buildDataObjects<T extends TSystemData>(dataProto: TTypeProto<TSystemData>, entities: Set<IEntity>): Set<T> {
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
        this.entities.push(entity);
        return entity;
    }

    async dispatch(state?: IState): Promise<void> {
        if (!state) {
            state = this.defaultState;
        }

        {
            let stateSystem;
            let parallelRunningSystems = [];
            for (let system of this.sortedSystems) {
                stateSystem = state.systems.find(stateSys => stateSys.constructor.name === system.system.constructor.name);
                if (stateSystem) {
                    if (system.dependencies.length > 0) {
                        await Promise.all(parallelRunningSystems);
                        parallelRunningSystems = [];
                        await system.system.update(this.systemWorld, this.buildDataObjects(system.system.SystemData, system.system.entities));
                    }
                    else {
                        parallelRunningSystems.push(system.system.update(this.systemWorld, this.buildDataObjects(system.system.SystemData, system.system.entities)))
                    }
                }
            }
        }
    }

    getEntities<C extends Object, T extends TComponentAccess<C>>(query?: T[]): IEntity[] {
        if (!query) {
            return this.entities;
        }

        const resultEntities = [];

        entityLoop: for (const entity of this.entities) {
            for (let componentRequirement of query) {
                if (
                    (componentRequirement[access].type == EAccess.SET && !entity.hasComponent(componentRequirement[access].component)) ||
                    (componentRequirement[access].type == EAccess.UNSET && entity.hasComponent(componentRequirement[access].component))
                ) continue entityLoop;
            }

            resultEntities.push(entity);
        }

        return resultEntities;
    }

    getResource<T extends Object>(type: TTypeProto<T>): T {
        if (!this.resources.has(type)) {
            throw new Error(`Resource of type "${type.name}" does not exist!`);
        }

        return this.resources.get(type) as T;
    }

    maintain(): void {
        this.sortedSystems = this.sortSystems(this.sortedSystems);

        let entity;
        let system;
        for (system of this.sortedSystems) {
            system.system.clearEntities();
            for (entity of this.entities) {
                entity._updateSystem(this, system.system);
            }
        }
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
            for (let system of this.sortedSystems.reverse()) {
                stateSystem = dependencySystems.includes(system.system.constructor.name)
                    ? system.system
                    : newState.systems.find(stateSys =>
                        stateSys.constructor.name === system.system.constructor.name);


                if (stateSystem) {
                    this.runSystems.push({
                        system: stateSystem,
                        hasDependencies: system.dependencies.length > 0,
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

    registerSystem(system: ISystem<any>, dependencies?: TSystemProto<any>[]): IWorld {
        this.registerSystemQuick(system, dependencies);
        for (let entity of this.entities) {
            entity._updateSystem(this, system);
        }

        this.sortedSystems = this.sortSystems(this.sortedSystems);
        return this;
    }

    registerSystemQuick(system: ISystem<any>, dependencies?: TSystemProto<any>[]): IWorld {
        if (this.sortedSystems.find(node => node.system.constructor === system.constructor)) {
            throw new Error(`The system "${system.constructor.name}" was already added to the world!`);
        }

        this.defaultState.systems.push(system);
        this.sortedSystems.push({ system, dependencies: dependencies || [] });
        return this;
    }

    removeEntity(entity: IEntity): void {
        const index = this.entities.indexOf(entity);
        if (index < 0) return;

        this.entities.splice(index, 1);
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

        let resolver = () => {};

        if (this.runPromise) {
            throw new Error('The dispatch loop is already running!');
        }

        if (!configuration) {
            configuration = {};
        }

        if (!configuration.initialState) {
            configuration.initialState = this.defaultState;
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
            let system;
            const mainLoop = async () => {
                if (!this.shouldRunSystems) {
                    this.runPromise = undefined;
                    resolver();
                    return;
                }

                if (configuration?.preFrameHandler) {
                    await configuration?.preFrameHandler(this.transitionWorld);
                }

                for (system of this.runSystems) {
                    if (system.hasDependencies) {
                        await Promise.all(parallelRunningSystems);
                        parallelRunningSystems = [];
                        await system.system.update(this.systemWorld, system.system.entities);
                    }
                    else {
                        parallelRunningSystems.push(system.system.update(this.systemWorld, this.buildDataObjects(system.system.SystemData, system.system.entities)))
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
