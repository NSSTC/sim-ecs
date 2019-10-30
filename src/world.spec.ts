import {IEntity} from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem, {TComponentQuery, TSystemProto} from "./system.spec";
import IState from "./state.spec";
import {TTypeProto} from "./_.spec";

export type TRunConfiguration = {
    initialState?: IState,
    preFrameHandler?: () => Promise<void>
};
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
     * @param args constructor parameters
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
     * Change the state of a running world
     * @param newState
     */
    changeRunningState(newState: IState): Promise<void>

    /**
     * Execute all systems
     * @param state
     */
    dispatch(state?: IState): Promise<void>

    /**
     * Query entities and find the ones with a certain combination of component
     * @param withComponents
     */
    getEntities(withComponents?: TComponentQuery): IEntity[]

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

    /**
     * Signal the world to stop its dispatch-loop
     * Resolves once the loop stops
     */
    stopRun(): Promise<void>

    /**
     * Execute all systems continuously in a dispatch-loop
     * Contains performance benefits by pre-calculating and pre-scheduling the execution
     * @param configuration
     */
    run(configuration?: TRunConfiguration): Promise<void>
}

export type TWorldProto = { new(): IWorld };
export default IWorld;
