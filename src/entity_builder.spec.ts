import {IEntity} from "./entity.spec";
import IComponent from "./component.spec";

export interface IEntityBuilder {
    build(): IEntity
    with(component: IComponent | { new(): IComponent }, ...args: any[]): IEntityBuilder

    /**
     * Adds component without doing entity-system-dependency calculations.
     * Must call world.maintain() to trigger changes.
     */
    withQuick(component: IComponent | { new(): IComponent }, ...args: any[]): IEntityBuilder
}

export default IEntityBuilder;
