import {IEntity} from "./entity.spec";
import {TObjectProto} from "./_.spec";

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
    with(component: Object | TObjectProto, ...args: any[]): IEntityBuilder

    /**
     * Adds component without doing entity-system-dependency calculations.
     * Must call world.maintain() to trigger changes.
     */
    withQuick(component: Object | TObjectProto, ...args: any[]): IEntityBuilder
}

export type TEntityBuilderProto = { new(): TEntityBuilderProto };
export default IEntityBuilder;
