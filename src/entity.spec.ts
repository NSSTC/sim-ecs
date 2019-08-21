import IComponent from "./component.spec";
import IWorld from "./world.spec";
import {Component} from "./component";
import ISystem from "./system.spec";

export interface IEntity {
    addComponent(component: IComponent): IEntity

    /**
     * Add a component without recalculating the entity dependencies.
     * Must call world.maintain() in order to trigger changes
     * @param component
     */
    addComponentQuick(component: IComponent): IEntity
    getComponent<T extends IComponent>(component: { new(): T }): T | undefined
    hasComponent(component: typeof Component): boolean
    hasComponentName(name: string): boolean
    removeComponent(component: IComponent): IEntity
    setWorld(world: IWorld): IEntity
    _updateSystem(world: IWorld, system: ISystem): void
    _updateSystems(world: IWorld): void
}

export default IEntity;
