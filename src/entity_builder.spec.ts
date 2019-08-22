import {IEntity} from "./entity.spec";
import {IComponent, TComponentProto} from "./component.spec";

export interface IEntityBuilder {
    /**
     * Create entity and add it to the world
     */
    build(): IEntity

    /**
     * Associate component with target entity
     * @param component
     * @param args
     */
    with(component: IComponent | TComponentProto, ...args: any[]): IEntityBuilder

    /**
     * Adds component without doing entity-system-dependency calculations.
     * Must call world.maintain() to trigger changes.
     */
    withQuick(component: IComponent | TComponentProto, ...args: any[]): IEntityBuilder
}

export type TEntityBuilderProto = { new(): TEntityBuilderProto };
export default IEntityBuilder;
