import {Entity} from "./entity";
import {EntityBuilder} from "./entity_builder";
import {IWorld, TSystemNode} from "./world.spec";
import IEntity from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem from "./system.spec";
import {IState, State} from "./state";

// @ts-ignore
import toposort from 'toposort';

export * from './world.spec';

export class World implements IWorld {
    protected defaultState = new State();
    protected entities: IEntity[] = [];
    protected lastDispatch = 0;
    protected resources: Map<{ new(): Object }, Object> = new Map();
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

    addResource<T extends Object>(obj: T | { new(): T }, ...args: any[]): IWorld {
        let type: { new(): T };
        let instance: T;
        if (typeof obj === 'object') {
            type = obj.constructor as { new(): T };
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

    createEntity(): Entity {
        const entity = new Entity();
        this.entities.push(entity);
        return entity;
    }

    dispatch(state?: IState): void {
        const currentTime = Date.now();

        if (!state) {
            state = this.defaultState;
        }

        if (this.lastDispatch === 0) {
            this.lastDispatch = currentTime;
        }

        for (let system of state.systems) {
            system.update(this, system.entities, currentTime - this.lastDispatch);
        }

        this.lastDispatch = currentTime;
    }

    getResource<T extends Object>(type: { new(): T }): T {
        if (! this.resources.has(type)) {
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

    registerSystem(system: ISystem, dependencies?: ({ new(): ISystem })[]): IWorld {
        this.registerSystemQuick(system, dependencies);
        for (let entity of this.entities) {
            entity._updateSystem(this, system);
        }

        this.sortedSystems = this.sortSystems(this.sortedSystems);
        return this;
    }

    registerSystemQuick(system: ISystem, dependencies?: { new(): ISystem }[]): IWorld {
        if (this.sortedSystems.find(node => node.system.constructor === system.constructor)) {
            throw new Error(`The system "${system.constructor.name}" was already added to the world!`);
        }

        this.defaultState.systems.push(system);
        this.sortedSystems.push({ system, dependencies: dependencies || [] });
        return this;
    }

    // toposort with Kahn
    // https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
    protected sortSystems(unsorted: TSystemNode[]): TSystemNode[] {
        type TSystemType = { new(): ISystem };
        const graph = new Map<TSystemType, TSystemType[]>();
        let edges: TSystemType[];

        for (let {system} of unsorted) {
            graph.set(system.constructor as TSystemType, []);
        }

        for (let {system, dependencies} of unsorted) {
            for (let dep of dependencies) {
                edges = graph.get(dep) as TSystemType[];
                if (!edges.includes(system.constructor as TSystemType)) {
                    edges.push(system.constructor as TSystemType);
                }

                graph.set(dep, edges);
            }
        }


        const L: TSystemType[] = []; // Empty list that will contain the sorted elements
        const S = Array.from(graph.entries()).filter(pair => pair[1].length === 0).map(pair => pair[0]); // Set of all nodes with no incoming edge
        let n: TSystemType;

        // while S is non-empty do
        while (S.length > 0) {
            // remove a node n from S
            n = S.shift() as TSystemType;
            // add n to tail of L
            L.push(n);

            // for each node m with an edge e from n to m do
            for (let m of Array.from(graph.entries()).filter(pair => pair[1].includes(n)).map(pair => pair[0])) {
                // remove edge e from the graph
                edges = graph.get(m) as TSystemType[];
                edges.splice(edges.indexOf(n), 1);
                graph.set(m, edges);

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
}
