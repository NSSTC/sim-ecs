import IComponent, {TComponentProto} from "./component.spec";
import IWorld from "./world.spec";
import {Component} from "./component";
import ISystem from "./system.spec";
import {TTypeProto} from "./_.spec";

export interface IEntity {
    /**
     * Add a component to this entity
     * @param component
     */
    addComponent(component: IComponent): IEntity

    /**
     * Add a component without recalculating the entity dependencies.
     * Must call world.maintain() in order to trigger changes
     * @param component
     */
    addComponentQuick(component: IComponent): IEntity

    /**
     * Get a component of a certain type which is associated with this entity
     * @param component
     */
    getComponent<T extends IComponent>(component: TTypeProto<T>): T | undefined

    /**
     * Check if a certain component is associated with this entity
     * @param component
     */
    hasComponent(component: typeof Component | TComponentProto): boolean

    /**
     * Check if a certain component is associated with this entity based on the type name
     * @param name
     */
    hasComponentName(name: string): boolean

    /**
     * Un-associate a component from this entity
     * @param component
     */
    removeComponent(component: IComponent): IEntity

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
