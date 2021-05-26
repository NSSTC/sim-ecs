import {IEntity} from "./entity.spec";
import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import IState, {TStateProto} from "./state.spec";
import {TTypeProto} from "./_.spec";
import {TAccessDescriptor} from "./query.spec";
import {ISerDe, TSerDeOptions, TSerializer} from "./serde/serde.spec";
import {ISerialFormat} from "./serde/serial-format.spec";
import {ICommands} from "./commands/commands.spec";
import IEntityBuilder from "./entity-builder.spec";

export type TEntityInfo = {
    entity: IEntity
    usage: Map<TSystemInfo<TSystemData>, TSystemData>
};
export type TExecutionFunction = ((callback: Function) => any) | typeof setTimeout | typeof requestAnimationFrame;
export type TGroupHandle = number;

export interface IRunConfiguration {
    afterStepHandler?: (actions: ITransitionActions) => Promise<void> | void
    beforeStepHandler?: (actions: ITransitionActions) => Promise<void> | void
    executionFunction?: TExecutionFunction
    initialState?: TStateProto
}

export interface IStaticRunConfiguration {
    afterStepHandler: (actions: ITransitionActions) => Promise<void> | void
    beforeStepHandler: (actions: ITransitionActions) => Promise<void> | void
    executionFunction: TExecutionFunction
    initialState: TStateProto,
}

export type TSystemInfo<D extends TSystemData> = {
    dataPrototype: TTypeProto<D>
    dataSet: Set<D>
    dependencies: Set<TSystemProto<TSystemData>>
    system: ISystem<D>
};
export type TSystemNode = { system: ISystem<TSystemData>, dependencies: TSystemProto<TSystemData>[] };

export interface IPartialWorld {
    readonly commands: ICommands
    readonly serde: ISerDe

    /**
     * Convenience builder to create a new Entity
     */
    buildEntity(): IEntityBuilder

    /**
     * Execute all commands NOW
     */
    flushCommands(): Promise<void>

    /**
     * Query entities and find the ones with a certain combination of component
     * @param query
     */
    getEntities<C extends Object, T extends TAccessDescriptor<C>>(query?: T[]): IterableIterator<IEntity>

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
    save<C extends Object, T extends TAccessDescriptor<C>>(query?: T[], options?: TSerDeOptions<TSerializer>): ISerialFormat
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
    getEntities<C extends Object, T extends TAccessDescriptor<C>>(query?: T[]): IterableIterator<IEntity>

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
    readonly systems: ISystem<TSystemData>[]

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
    dispatch(state?: TStateProto): Promise<void>

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
