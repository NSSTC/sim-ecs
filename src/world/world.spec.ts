import type {TObjectProto, TTypeProto} from "../_.spec";
import type {IEntity} from "../entity/entity.spec";
import type {ISerDeOptions, TDeserializer, TSerializer} from "../serde/serde.spec";
import type {InstanceMap} from "../util/instance-map";
import type {IEntitiesQuery} from "../query/query.spec";
import type {IEntityBuilder} from "../entity/entity-builder.spec";
import type {IRuntimeWorld} from "./runtime/runtime-world.spec";
import type {ISerialFormat} from "../serde/serial-format.spec";
import type {IPreptimeWorld} from "./preptime/preptime-world.spec";


export type TGroupHandle = number;

export interface IWorldData {
    entities: Set<IEntity>
    groups: {
        nextHandle: TGroupHandle,
        entityLinks: Map<TGroupHandle, Set<IEntity>>,
    }
    resources: InstanceMap<TObjectProto>
}

export interface IWorld extends IImmutableWorld, IMutableWorld {
    data: IWorldData
}

export interface IImmutableWorld {
    /// ****************************************************************************************************************
    /// Entities
    /// ****************************************************************************************************************

    /**
     * Query entities and find the ones with a certain combination of component.
     * To get a single entity by ID, please use the global function `getEntity()`
     * @param query
     */
    getEntities(query?: IEntitiesQuery): IterableIterator<IEntity>

    /**
     * Check whether an entity exists in this world
     * @param entity
     */
    hasEntity(entity: IEntity): boolean


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
    save(options?: ISerDeOptions<TSerializer>): ISerialFormat


    /// ****************************************************************************************************************
    /// Resources
    /// ****************************************************************************************************************

    /**
     * Get a resource which was previously stored
     * @param type
     */
    getResource<T extends Object>(type: TTypeProto<T>): T

    /**
     * Get all resources stored in this world. Useful for debugging
     * @param types
     */
    getResources<T extends Object>(types?: Array<TTypeProto<T>> | IterableIterator<TTypeProto<T>>): IterableIterator<T>

    /**
     * Check if a resource was stored
     * @param type
     */
    hasResource<T extends Object>(type: T | TTypeProto<T>): boolean
}

export interface IMutableWorld {
    /// ****************************************************************************************************************
    /// Entities
    /// ****************************************************************************************************************

    /**
     * Add an entity to this world
     * @param entity
     */
    addEntity(entity: IEntity): void

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
    removeEntity(entity: IEntity): void


    /// ****************************************************************************************************************
    /// Groups
    /// ****************************************************************************************************************

    /**
     * Add an entity in this world to a group in this world
     * @param groupHandle
     * @param entity
     */
    addEntityToGroup(groupHandle: TGroupHandle, entity: IEntity): void

    /**
     * Add several entities in this world to a group in this world
     * @param groupHandle
     * @param entities
     */
    addEntitiesToGroup(groupHandle: TGroupHandle, entities: Array<IEntity> | IterableIterator<IEntity>): void

    /**
     * Move group from other world to this one.
     * A new handle will be generated!
     * @param otherWorld
     * @param groupHandle
     */
    assimilateGroup(otherWorld: IPreptimeWorld, groupHandle: TGroupHandle): TGroupHandle

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
    merge(world: IPreptimeWorld | IRuntimeWorld, intoGroup?: TGroupHandle): [TGroupHandle, Array<IEntity>]


    /// ****************************************************************************************************************
    /// Prefabs
    /// ****************************************************************************************************************

    /**
     * Load a prefab
     * @param prefab
     * @param options
     * @param intoGroup
     */
    load(prefab: ISerialFormat, options?: ISerDeOptions<TDeserializer>, intoGroup?: TGroupHandle): TGroupHandle


    /// ****************************************************************************************************************
    /// Resources
    /// ****************************************************************************************************************

    /**
     * Add a resource to this world and returns the resource instance
     * @param type
     * @param args constructor parameters
     */
    addResource<T extends Object>(type: T | TTypeProto<T>, ...args: Array<unknown>): T

    /**
     * Remove all resources from this world
     */
    clearResources(): void

    /**
     * Remove a resource from this world
     * @param type
     */
    removeResource<T extends Object>(type: TTypeProto<T>): void

    /**
     * Replace a resource from this world with a new value
     * @param obj
     * @param args
     */
    replaceResource<T extends Object>(obj: T | TTypeProto<T>, ...args: Array<unknown>): void
}
