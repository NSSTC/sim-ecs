import {IEntity} from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem, {TSystemProto} from "./system.spec";
import IState from "./state.spec";
import {TTypeProto} from "./_.spec";

export type TSystemNode = { system: ISystem, dependencies: TSystemProto[]};

export interface IWorld {
    /**
     * Systems which are registered with this world
     */
    readonly systems: ISystem[]

    /**
     * Add an entity to this world
     * @param entity
     */
    addEntity(entity: IEntity): IWorld

    /**
     * Add a resource to this world
     * @param type
     * @param args
     */
    addResource<T extends Object>(type: T | TTypeProto<T>, ...args: any[]): IWorld

    /**
     * Build an entity and add it to this world using an entity builder
     */
    buildEntity(): IEntityBuilder

    /**
     * Create a new entity and add it to this world
     */
    createEntity(): IEntity

    /**
     * Execute all systems
     * @param state
     */
    dispatch(state?: IState): Promise<void>

    /**
     * Get a resource which was previously stored
     * @param type
     */
    getResource<T extends Object>(type: TTypeProto<T>): T

    /**
     * Re-calculate all entity, component and system dependencies and connections
     */
    maintain(): void

    /**
     * Add system to the world
     * @param system
     * @param dependencies
     */
    registerSystem(system: ISystem, dependencies?: TSystemProto[]): IWorld

    /**
     * Inserts a system without adding entities or sorting the dependency graph
     * Must call world.maintain() afterwards!
     * @param system
     * @param dependencies
     */
    registerSystemQuick(system: ISystem, dependencies?: TSystemProto[]): IWorld
}

export type TWorldProto = { new(): IWorld };
export default IWorld;
