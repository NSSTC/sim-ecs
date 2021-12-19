import {IEntity} from "./entity.spec";
import {IISystemProto, ISystem} from "./system.spec";
import {IIStateProto, IState} from "./state.spec";
import {TObjectProto, TTypeProto} from "./_.spec";
import {IAccessDescriptor, IAccessQuery, TExistenceQuery} from "./query/query.spec";
import {ISerDe, TSerDeOptions, TSerializer} from "./serde/serde.spec";
import {ISerialFormat} from "./serde/serial-format.spec";
import {ICommands} from "./commands/commands.spec";
import IEntityBuilder from "./entity-builder.spec";
import {Query} from "./query/query";
import {SerDe} from "./serde/serde";
import {IScheduler} from "./scheduler/scheduler.spec";

export type TExecutionFunction = ((callback: Function) => any) | typeof setTimeout | typeof requestAnimationFrame;
export type TGroupHandle = number;
export type TStates = Map<IIStateProto, Set<ISystem>>;

export interface IRunConfiguration {
    executionFunction?: TExecutionFunction
    initialState?: IIStateProto
}

export interface IStaticRunConfiguration {
    executionFunction: TExecutionFunction
    initialState: IIStateProto,
}

export interface ISystemInfo {
    dependencies: Set<IISystemProto>
    system: ISystem
}

export interface IWorldConstructorOptions {
    name?: string
    defaultScheduler: IScheduler
    stateSchedulers: Map<IIStateProto, IScheduler>
    serde?: SerDe
}

export interface IPartialWorld {
    readonly commands: ICommands
    readonly name?: string
    readonly serde: ISerDe

    /**
     * Execute all commands NOW
     */
    flushCommands(): Promise<void>

    /**
     * Query entities and find the ones with a certain combination of component
     * @param query
     */
    getEntities(query?: Query<IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>>): IterableIterator<IEntity>

    /**
     * Get a resource which was previously stored
     * @param type
     */
    getResource<T extends Object>(type: TTypeProto<T>): T

    /**
     * Get all resources stored in this world. Useful for debugging
     */
    getResources(): IterableIterator<unknown>

    /**
     * Re-calculate all entity, component and system dependencies and connections
     */
    maintain(): void

    /**
     * Prepare a savable version of the current world.
     * The query can be used to only save a sub-set with specific conditions
     * @param query
     * @param options
     */
    save<C extends Object, T extends IAccessDescriptor<C>>(query?: Query<TExistenceQuery<TObjectProto>>, options?: TSerDeOptions<TSerializer>): ISerialFormat
}

/**
 * Actions which an be called from a stage
 */
export interface IStageAction {
    systemActions: ISystemActions
    readonly systems: Readonly<Map<IISystemProto, ISystem>>
}

/**
 * Actions which can be called from a system run
 */
export interface ISystemActions {
    readonly commands: ICommands
    readonly currentState: IState | undefined

    /**
     * Query entities and find the ones with a certain combination of component
     * @param query
     */
    getEntities(query?: Query<IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>>): IterableIterator<IEntity>

    /**
     * Get a resource which was previously stored
     * @param type
     */
    getResource<T extends Object>(type: TTypeProto<T>): T
}

/**
 * Actions which can be called during an iteration-transition
 */
export interface ITransitionActions extends IPartialWorld {
    readonly currentState: IState | undefined
}

export interface IWorld extends IPartialWorld {
    /**
     * Add an entity to this world
     * @param entity
     */
    addEntity(entity: IEntity): void

    /**
     * Add a resource to this world and returns the resource instance
     * @param type
     * @param args constructor parameters
     */
    addResource<T extends Object>(type: T | TTypeProto<T>, ...args: unknown[]): T

    /**
     * Convenience builder to create a new Entity
     */
    buildEntity(uuid?: string): IEntityBuilder

    /**
     * Clear all entities and groups from this world
     */
    clearEntities(): void

    /**
     * Remove all resources from this world
     */
    clearResources(): void

    /**
     * Create a new entity and add it to this world
     */
    createEntity(): IEntity

    /**
     * Create a new group and add it to this world
     */
    createGroup(): TGroupHandle

    /**
     * Execute all systems
     * @param state
     */
    dispatch(state?: IIStateProto): Promise<void>

    /**
     * Merge entities from another world into this one
     * @param world
     */
    merge(world: IWorld): [TGroupHandle, IEntity[]]

    /**
     * Remove an entity from this world
     * @param entity
     */
    removeEntity(entity: IEntity): void

    /**
     * Remove a group and all entities inside from this world
     * @param handle
     */
    removeGroup(handle: TGroupHandle): void

    /**
     * Remove a resource from this world
     * @param type
     */
    removeResource<T extends Object>(type: TTypeProto<T>): void

    /**
     * Execute all systems continuously in a dispatch-loop
     * Contains performance benefits by pre-calculating and pre-scheduling the execution
     * @param configuration
     */
    run(configuration?: IRunConfiguration): Promise<void>
}

export type TWorldProto = { new(): IWorld };
export default IWorld;
