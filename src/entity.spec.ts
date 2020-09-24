import {IEntityWorld} from "./world.spec";
import {TObjectProto, TTypeProto} from "./_.spec";
import {TComponentAccess} from "./queue.spec";

export interface IEntity {
    /**
     * Add a component to this entity
     * @param component
     */
    addComponent(component: Object): IEntity

    /**
     * Relocate this entity to a new world
     * @param newWorld
     */
    changeWorldTo(newWorld?: IEntityWorld): void

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
     * Check if a certain component is associated with this entity
     * @param component
     */
    hasComponent(component: typeof Object | TObjectProto): boolean

    /**
     * Check if this entity matches a queue for components
     */
    matchesQueue<C extends Object, T extends TComponentAccess<C>>(query: T[]): boolean

    /**
     * Un-associate a component from this entity
     * @param component
     */
    removeComponent(component: Object): IEntity
}

export type TEntityProto = { new(): IEntity };
export default IEntity;
