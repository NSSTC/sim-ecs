import IWorld from "./world.spec";
import ISystem from "./system.spec";
import {TObjectProto, TTypeProto} from "./_.spec";

export interface IEntity {
    /**
     * Add a component to this entity
     * @param component
     */
    addComponent(component: Object): IEntity

    /**
     * Add a component without recalculating the entity dependencies.
     * Must call world.maintain() in order to trigger changes
     * @param component
     */
    addComponentQuick(component: Object): IEntity

    /**
     * Remove this entity from the world, deleting all of its components
     */
    destroy(): void

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
     * Check if a certain component is associated with this entity based on the type name
     * @param name
     */
    hasComponentName(name: string): boolean

    /**
     * Un-associate a component from this entity
     * @param component
     */
    removeComponent(component: Object): IEntity

    /**
     * Set the parent world of this entity
     * @param world
     */
    setWorld(world: IWorld): IEntity

    _updateSystem(world: IWorld, system: ISystem): void
    _updateSystems(world: IWorld): void
}

export type TEntityProto = { new(): IEntity };
export default IEntity;
