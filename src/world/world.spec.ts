import type {TTypeProto} from "../_.spec.ts";
import type {IEntity} from "../entity/entity.spec.ts";
import type {ISerDeOptions, TDeserializer, TSerializer} from "../serde/serde.spec.ts";
import type {IEntitiesQuery, TExistenceQuery} from "../query/query.spec.ts";
import type {IEntityBuilder} from "../entity/entity-builder.spec.ts";
import type {IRuntimeWorld} from "./runtime/runtime-world.spec.ts";
import type {ISerialFormat} from "../serde/serial-format.spec.ts";
import type {IPreptimeWorld} from "./preptime/preptime-world.spec.ts";


export type TGroupHandle = number;

export interface IWorld extends IImmutableWorld, IMutableWorld {}

export interface IImmutableWorld {
    /// ****************************************************************************************************************
    /// Entities
    /// ****************************************************************************************************************

    /**
     * Query entities and find the ones with a certain combination of component.
     * To get a single entity by ID, please use the global function `getEntity()`
     * @param query
     */
    getEntities(query?: Readonly<IEntitiesQuery>): IterableIterator<IEntity>

    /**
     * Check whether an entity exists in this world
     * @param entity
     */
    hasEntity(entity: Readonly<IEntity>): boolean


    /// ****************************************************************************************************************
    /// Groups
    /// ****************************************************************************************************************

    /**
     * Get all entities associated with a group
     * @param groupHandle
     */
    getGroupEntities(groupHandle: TGroupHandle): IterableIterator<IEntity>


    /// ****************************************************************************************************************
    /// Prefabs
    /// ****************************************************************************************************************

    /**
     * Prepare a savable version of the current world.
     * The query can be used to only save a sub-set with specific conditions
     * @param options
     */
    save(options?: Readonly<ISerDeOptions<TSerializer>>): ISerialFormat


    /// ****************************************************************************************************************
    /// Resources
    /// ****************************************************************************************************************

    /**
     * Get a resource which was previously stored
     * @param type
     */
    getResource<T extends object>(type: TTypeProto<T>): T

    /**
     * Get all resources stored in this world. Useful for debugging
     * @param types
     */
    getResources(types?: Readonly<TExistenceQuery<any>>): IterableIterator<object>

    /**
     * Check if a resource was stored
     * @param type
     */
    hasResource<T extends object>(type: T | TTypeProto<T>): boolean
}

export interface IMutableWorld {
    /// ****************************************************************************************************************
    /// Entities
    /// ****************************************************************************************************************

    /**
     * Add an entity to this world
     * @param entity
     */
    addEntity(entity: Readonly<IEntity>): void

    /**
     * Convenience builder to create a new Entity
     * @param uuid
     */
    buildEntity(uuid?: string): IEntityBuilder

    /**
     * Clear all entities and groups from this world
     */
    clearEntities(): void

    /**
     * Create a new entity and add it to this world
     */
    createEntity(): IEntity

    /**
     * Remove an entity from this world
     * @param entity
     */
    removeEntity(entity: Readonly<IEntity>): void


    /// ****************************************************************************************************************
    /// Groups
    /// ****************************************************************************************************************

    /**
     * Add an entity in this world to a group in this world
     * @param groupHandle
     * @param entity
     */
    addEntityToGroup(groupHandle: TGroupHandle, entity: Readonly<IEntity>): void

    /**
     * Add several entities in this world to a group in this world
     * @param groupHandle
     * @param entities
     */
    addEntitiesToGroup(groupHandle: TGroupHandle, entities: ReadonlyArray<Readonly<IEntity>> | IterableIterator<IEntity>): void

    /**
     * Move group from other world to this one.
     * A new handle will be generated!
     * @param otherWorld
     * @param groupHandle
     */
    assimilateGroup(otherWorld: Readonly<IPreptimeWorld>, groupHandle: TGroupHandle): TGroupHandle

    /**
     * Disband all groups.
     * Entities will not be removed
     */
    clearGroups(): void

    /**
     * Create a new group and add it to this world
     */
    createGroup(): TGroupHandle

    /**
     * Remove a group and all entities inside from this world
     * @param groupHandle
     */
    removeGroup(groupHandle: TGroupHandle): void


    /// ****************************************************************************************************************
    /// Misc
    /// ****************************************************************************************************************

    /**
     * Merge entities from another world into this one
     * @param world
     * @param intoGroup
     */
    merge(world: Readonly<IPreptimeWorld | IRuntimeWorld>, intoGroup?: TGroupHandle): [TGroupHandle, Array<IEntity>]


    /// ****************************************************************************************************************
    /// Prefabs
    /// ****************************************************************************************************************

    /**
     * Load a prefab
     * @param prefab
     * @param options
     * @param intoGroup
     */
    load(
        prefab: Readonly<ISerialFormat>,
        options?: Readonly<ISerDeOptions<TDeserializer>>,
        intoGroup?: TGroupHandle,
    ): TGroupHandle


    /// ****************************************************************************************************************
    /// Resources
    /// ****************************************************************************************************************

    /**
     * Add a resource to this world and returns the resource instance
     * @param type
     * @param args constructor parameters
     */
    addResource<T extends object>(type: T | TTypeProto<T>, ...args: ReadonlyArray<unknown>): T | TTypeProto<T>

    /**
     * Remove all resources from this world
     */
    clearResources(): void

    /**
     * Remove a resource from this world
     * @param type
     */
    removeResource<T extends object>(type: TTypeProto<T>): void
}
