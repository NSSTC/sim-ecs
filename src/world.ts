import {Entity} from "./entity";
import {EntityBuilder} from "./entity_builder";
import {IWorld, TSystemNode} from "./world.spec";
import IEntity from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem, {TComponentQuery, TSystemProto} from "./system.spec";
import {IState, State} from "./state";
import {TTypeProto} from "./_.spec";

export * from './world.spec';

export class World implements IWorld {
    protected defaultState = new State();
    protected entities: IEntity[] = [];
    protected lastDispatch = 0;
    protected resources = new Map<{ new(): Object }, Object>();
    protected runPromise?: Promise<void>;
    protected runState?: IState;
    protected runSystems: { system: ISystem, hasDependencies: boolean }[] = [];
    protected shouldRunSystems = false;
    protected sortedSystems: TSystemNode[] = [];

    get systems(): ISystem[] {
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
            // @ts-ignore
            instance = new (obj.bind.apply(obj, [obj].concat(Array.from(arguments).slice(1))))();
        }

        if (this.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" already exists!`);
        }

        this.resources.set(type, instance);
        return this;
    }

    buildEntity(): IEntityBuilder {
        return new EntityBuilder(this);
    }

    async changeRunningState(newState: IState): Promise<void> {
        let stateSystem;

        this.runState && await this.runState.deactivate(this);
        this.runState = newState;
        this.runSystems.length = 0;
        for (let system of this.sortedSystems) {
            stateSystem = newState.systems.find(stateSys => stateSys.constructor.name === system.system.constructor.name);
            if (stateSystem) {
                this.runSystems.push({
                    system: stateSystem,
                    hasDependencies: system.dependencies.length > 0,
                });
            }
        }

        await this.runState.activate(this);
    }

    createEntity(): Entity {
        const entity = new Entity();
        this.entities.push(entity);
        return entity;
    }

    async dispatch(state?: IState): Promise<void> {
        const currentTime = Date.now();

        if (!state) {
            state = this.defaultState;
        }

        if (this.lastDispatch === 0) {
            this.lastDispatch = currentTime;
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
                        await system.system.update(this, system.system.entities, currentTime - this.lastDispatch);
                    }
                    else {
                        parallelRunningSystems.push(system.system.update(this, system.system.entities, currentTime - this.lastDispatch))
                    }
                }
            }
        }

        this.lastDispatch = currentTime;
    }

    getEntities(withComponents?: TComponentQuery): IEntity[] {
        if (!withComponents) {
            return this.entities;
        }

        const resultEntities = [];

        entityLoop: for (const entity of this.entities) {
            for (let componentRequirement of Object.entries(withComponents)) {
                if (entity.hasComponentName(componentRequirement[0]) !== componentRequirement[1]) continue entityLoop;
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
        for (let entity of this.entities) {
            entity._updateSystems(this);
        }
    }

    registerSystem(system: ISystem, dependencies?: TSystemProto[]): IWorld {
        this.registerSystemQuick(system, dependencies);
        for (let entity of this.entities) {
            entity._updateSystem(this, system);
        }

        this.sortedSystems = this.sortSystems(this.sortedSystems);
        return this;
    }

    registerSystemQuick(system: ISystem, dependencies?: TSystemProto[]): IWorld {
        if (this.sortedSystems.find(node => node.system.constructor === system.constructor)) {
            throw new Error(`The system "${system.constructor.name}" was already added to the world!`);
        }

        this.defaultState.systems.push(system);
        this.sortedSystems.push({ system, dependencies: dependencies || [] });
        return this;
    }

    protected sortSystems(unsorted: TSystemNode[]): TSystemNode[] {
        const graph = new Map(unsorted.map(node => [node.system.constructor as TSystemProto, node.dependencies]));
        let edges: TSystemProto[];

        /// toposort with Kahn
        /// https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
        const L: TSystemProto[] = []; // Empty list that will contain the sorted elements
        const S = Array.from(graph.entries()).filter(pair => pair[1].length === 0).map(pair => pair[0]); // Set of all nodes with no incoming edge
        let n: TSystemProto;

        // while S is non-empty do
        while (S.length > 0) {
            // remove a node n from S
            n = S.shift() as TSystemProto;
            // add n to tail of L
            L.push(n);

            // for each node m with an edge e from n to m do
            for (let m of Array.from(graph.entries()).filter(pair => pair[1].includes(n)).map(pair => pair[0])) {
                // remove edge e from the graph
                edges = graph.get(m) as TSystemProto[];
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

    async run(initialState?: IState): Promise<void> {
        // todo: this could be further optimized by allowing systems with dependencies to run in parallel
        //    if all of their dependencies already ran

        let resolver = () => {};

        if (this.runPromise) {
            throw new Error('The dispatch loop is already running!');
        }

        if (!initialState) {
            initialState = this.defaultState;
        }

        await this.changeRunningState(initialState);
        this.runPromise = new Promise<void>(res => { resolver = res });
        this.shouldRunSystems = true;

        if (this.lastDispatch === 0) {
            this.lastDispatch = Date.now();
        }

        {
            let currentTime;
            let parallelRunningSystems: Promise<void>[] = [];
            let system;
            const mainLoop = async () => {
                currentTime = Date.now();

                if (!this.shouldRunSystems) {
                    this.runPromise = undefined;
                    resolver();
                    return;
                }

                for (system of this.runSystems) {
                    if (system.hasDependencies) {
                        await Promise.all(parallelRunningSystems);
                        parallelRunningSystems = [];
                        await system.system.update(this, system.system.entities, currentTime - this.lastDispatch);
                    }
                    else {
                        parallelRunningSystems.push(system.system.update(this, system.system.entities, currentTime - this.lastDispatch))
                    }
                }

                this.lastDispatch = currentTime;
                requestAnimationFrame(mainLoop);
            };

            requestAnimationFrame(mainLoop);
        }
    }
}
