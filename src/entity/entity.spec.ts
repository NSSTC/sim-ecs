import type {TObjectProto, TTypeProto} from "../_.spec.ts";
import {ISerDe} from "../serde/serde.spec.ts";

export type TEntityId = string;
export type TTag = number | string;


export interface IReadOnlyEntity {
    /**
     * UUID to identify the entity across instances
     * The ID is generated and must be manually maintained when syncing with another instance
     */
    readonly id: TEntityId

    /**
     * Clone this entity with all of its components and tags.
     * This is done by serializing and de-serializing the entity
     * @param serde SerDe to use for serialization
     * @param uuid UUID of new component
     */
    clone(serde: ISerDe, uuid?: TEntityId): IEntity

    /**
     * Get a component of a certain type which is associated with this entity
     * @param component
     */
    getComponent<T extends object>(component: TTypeProto<T>): T | undefined

    /**
     * Get number of components associated with this entity
     */
    getComponentCount(): number

    /**
     * Get all components
     */
    getComponents(): IterableIterator<object>

    /**
     * Get number of tags associated with this entity
     */
    getTagCount(): number

    /**
     * Get all tags
     */
    getTags(): IterableIterator<TTag>

    /**
     * Check if a certain component is associated with this entity
     * @param component
     */
    hasComponent(component: typeof Object | TObjectProto): boolean

    /**
     * Check if this entity has a given tag
     * @param tag
     */
    hasTag(tag: TTag): boolean
}

export interface IEntity extends IReadOnlyEntity {
    /**
     * Add a component to this entity
     * @param component
     * @param args
     */
    addComponent(component: Readonly<object> | TObjectProto, ...args: ReadonlyArray<unknown>): IEntity

    /**
     * Add a tag to this entity
     * Tagging can be used to mark the entity instead of using an empty marker-component
     * Tags cannot be queried for! They are only markers
     * and should be implemented and used as lean and light-weight as possible.
     * @param tag
     */
    addTag(tag: TTag): IEntity

    /**
     * Un-associate a component from this entity
     * @param component
     */
    removeComponent(component: Readonly<object> | TObjectProto): IEntity

    /**
     * Remove a tag from this entity
     * @param tag
     */
    removeTag(tag: TTag): IEntity
}

export type TEntityProto = { new(): IEntity };
