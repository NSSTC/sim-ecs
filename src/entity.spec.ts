import IWorld, {IEntityWorld} from "./world.spec";
import ISystem from "./system.spec";
import {TObjectProto, TTypeProto} from "./_.spec";

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
     * Check if a certain component is associated with this entity
     * @param component
     */
    hasComponent(component: typeof Object | TObjectProto): boolean

    /**
     * Un-associate a component from this entity
     * @param component
     */
    removeComponent(component: Object): IEntity
}

export type TEntityProto = { new(): IEntity };
export default IEntity;
