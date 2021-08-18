import {IEntity} from "./entity.spec";
import {IISystemProto, ISystem} from "./system.spec";
import {IIStateProto, IState} from "./state.spec";
import {TObjectProto, TTypeProto} from "./_.spec";
import {IAccessDescriptor, IAccessQuery, TExistenceQuery} from "./query.spec";
import {ISerDe, TSerDeOptions, TSerializer} from "./serde/serde.spec";
import {ISerialFormat} from "./serde/serial-format.spec";
import {ICommands} from "./commands/commands.spec";
import IEntityBuilder from "./entity-builder.spec";
import {Query} from "./query";

export type TExecutionFunction = ((callback: Function) => any) | typeof setTimeout | typeof requestAnimationFrame;
export type TGroupHandle = number;
export type TStates = Map<IIStateProto, Set<ISystem>>;

export interface IRunConfiguration {
    afterStepHandler?: (actions: ITransitionActions) => Promise<void> | void
    beforeStepHandler?: (actions: ITransitionActions) => Promise<void> | void
    executionFunction?: TExecutionFunction
    initialState?: IIStateProto
}

export interface IStaticRunConfiguration {
    afterStepHandler: (actions: ITransitionActions) => Promise<void> | void
    beforeStepHandler: (actions: ITransitionActions) => Promise<void> | void
    executionFunction: TExecutionFunction
    initialState: IIStateProto,
}

export interface ISystemInfo {
    dependencies: Set<IISystemProto>
    system: ISystem
}

export interface IPartialWorld {
    readonly commands: ICommands
    readonly name?: string
    readonly serde: ISerDe

    /**
     * Convenience builder to create a new Entity
     */
    buildEntity(uuid?: string): IEntityBuilder

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
     * Systems which are registered with this world
     */
    readonly systemInfos: Set<ISystemInfo>

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
     * Create a new entity and add it to this world
     */
    createEntity(): IEntity

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
     * Execute all systems continuously in a dispatch-loop
     * Contains performance benefits by pre-calculating and pre-scheduling the execution
     * @param configuration
     */
    run(configuration?: IRunConfiguration): Promise<void>
}

export type TWorldProto = { new(): IWorld };
export default IWorld;
