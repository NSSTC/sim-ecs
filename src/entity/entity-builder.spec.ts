import type {IEntity} from "./entity.spec.ts";
import type {TObjectProto} from "../_.spec.ts";

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
    with(component: Readonly<object | TObjectProto>, ...args: ReadonlyArray<unknown>): IEntityBuilder

    /**
     * Add all components to target entity
     * @param component
     */
    withAll(...component: ReadonlyArray<object | TObjectProto>): IEntityBuilder
}

export type TEntityBuilderProto = { new(): TEntityBuilderProto };
