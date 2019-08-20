import {IEntity} from "./entity.spec";
import IComponent from "./component.spec";

export interface IEntityBuilder {
    build(): IEntity
    with(component: IComponent | { new(): IComponent }, ...args: any[]): IEntityBuilder
}

export default IEntityBuilder;
