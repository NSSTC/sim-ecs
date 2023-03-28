import type {TObjectProto} from "../../../_.spec.ts";

export interface ICommandEntityBuilder {
    /**
     * Create entity and add it to the world as a command
     */
    build(): void

    /**
     * Add component to target entity
     * @param component
     * @param args
     */
    with(component: object | TObjectProto, ...args: ReadonlyArray<unknown>): ICommandEntityBuilder

    /**
     * Add all components to target entity
     * @param component
     */
    withAll(...component: ReadonlyArray<object | TObjectProto>): ICommandEntityBuilder
}
