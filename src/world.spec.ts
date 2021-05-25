import {IEntity} from "./entity.spec";
import IEntityBuilder from "./entity-builder.spec";
import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import IState, {TStateProto} from "./state.spec";
import {TTypeProto} from "./_.spec";
import {TAccessDescriptor} from "./query.spec";
import {ISerDe, TDeserializer, TSerDeOptions, TSerializer} from "./serde/serde.spec";
import {ISerialFormat} from "./serde/serial-format.spec";

export type TEntityInfo = {
    entity: IEntity
    usage: Map<TSystemInfo<TSystemData>, TSystemData>
};
export type TExecutionFunction = ((callback: Function) => any) | typeof setTimeout | typeof requestAnimationFrame;
export type TPrefabEntity = { [Component: string]: unknown };
export type TPrefabHandle = number;
export type TSerialFormat = TPrefabEntity[];

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
    readonly serde: ISerDe

    /**
     * Get a resource which was previously stored
     * @param type
     */
    getResource<T extends Object>(type: TTypeProto<T>): T

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
     * Build an entity and add it to this world using an entity builder
     */
    buildEntity(): IEntityBuilder

    /**
     * Remove all entities from this world
     */
    clearEntities(): void

    /**
     * Create a new entity and add it to this world
     */
    createEntity(): IEntity

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
     * Load entities with components from a prefab or save
     * @param rawObj
     * @param options
     */
    load(rawObj: ISerialFormat, options?: TSerDeOptions<TDeserializer>): TPrefabHandle

    /**
     * Re-calculate all entity, component and system dependencies and connections
     */
    maintain(): void

    /**
     * Merge entities from another world into this one
     * @param world
     */
    merge(world: IWorld): void

    /**
     * Remove an entity from the world, deleting all of its components
     * @param entity
     */
    removeEntity(entity: IEntity): void

    /**
     * Remove a resource from the world
     * @param type
     */
    removeResource<T extends Object>(type: TTypeProto<T>): void

    /**
     * Replace all current entities with entities from another world
     * @param world
     */
    replaceEntitiesWith(world: IWorld): void

    /**
     * Replace a resource from this world
     * @param type
     * @param args constructor parameters
     */
    replaceResource<T extends Object>(type: T | TTypeProto<T>, ...args: unknown[]): void

    /**
     * Prepare a savable version of the current world.
     * The query can be used to only save a sub-set with specific conditions
     * @param query
     * @param options
     */
    save<C extends Object, T extends TAccessDescriptor<C>>(query?: T[], options?: TSerDeOptions<TSerializer>): ISerialFormat

    /**
     * Signal the world to stop its dispatch-loop
     */
    stopRun(): void

    /**
     * Remove entities with data-components from a prefab file
     * @param handle
     */
    unloadPrefab(handle: TPrefabHandle): void
}

/**
 * Actions which can be called from a system run
 */
export interface ISystemActions {
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

    /**
     * Revert the running world to a previous state
     */
    popState(): Promise<void>

    /**
     * Change the running world to a new state
     * @param NewState
     */
    pushState(NewState: TStateProto): Promise<void>
}

export interface IWorld extends IPartialWorld {
    /**
     * Systems which are registered with this world
     */
    readonly systems: ISystem<TSystemData>[]

    /**
     * Execute all systems
     * @param state
     */
    dispatch(state?: TStateProto): Promise<void>

    /**
     * Execute all systems continuously in a dispatch-loop
     * Contains performance benefits by pre-calculating and pre-scheduling the execution
     * @param configuration
     */
    run(configuration?: IRunConfiguration): Promise<void>
}

export interface IEntityWorld extends IPartialWorld {
    readonly isDirty: boolean
    readonly isRunning: boolean

    assignEntityToSystems(entity: IEntity): void

    removeEntityFromSystems(entity: IEntity): void
}

export type TWorldProto = { new(): IWorld };
export default IWorld;
