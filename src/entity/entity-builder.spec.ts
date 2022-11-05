import type {IEntity} from "./entity.spec";
import type {TObjectProto} from "../_.spec";

export interface IEntityBuilder {
    /**
     * Create entity and add it to the world
     */
    build(): IEntity

    /**
     * Add component to target entity
     * @param component
     * @param args
     */
    with(component: Object | TObjectProto, ...args: unknown[]): IEntityBuilder

    /**
     * Add all components to target entity
     * @param component
     */
    withAll(...component: (Object | TObjectProto)[]): IEntityBuilder
}

export type TEntityBuilderProto = { new(): TEntityBuilderProto };
export default IEntityBuilder;
