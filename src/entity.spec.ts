import {TObjectProto, TTypeProto} from "./_.spec";
import {TAccessDescriptor} from "./query.spec";
import IWorld from "./world.spec";

export type TTag = number | string;

export interface IEntity {
    /**
     * Add a component to this entity
     * @param component
     */
    addComponent(component: Object): IEntity

    /**
     * Add a tag to this entity
     * Tagging can be used to mark the entity instead of using an empty marker-component
     * Tags cannot be queried for! They are only markers
     * and should be implemented and used as lean and light-weight as possible.
     * @param tag
     */
    addTag(tag: TTag): IEntity

    /**
     * Relocate this entity to a new world
     * @param newWorld
     */
    changeWorldTo(newWorld?: IWorld): void

    /**
     * Get a component of a certain type which is associated with this entity
     * @param component
     */
    getComponent<T extends Object>(component: TTypeProto<T>): T | undefined

    /**
     * Get all components
     */
    getComponents(): IterableIterator<Object>

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

    /**
     * Check if this entity matches a queue for components
     */
    matchesQueue<C extends Object, T extends TAccessDescriptor<C>>(query: T[]): boolean

    /**
     * Un-associate a component from this entity
     * @param component
     */
    removeComponent(component: Object): IEntity

    /**
     * Remove a tag from this entity
     * @param tag
     */
    removeTag(tag: TTag): IEntity
}

export type TEntityProto = { new(): IEntity };
export default IEntity;
