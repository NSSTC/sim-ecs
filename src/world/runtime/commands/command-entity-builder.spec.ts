import type {TObjectProto} from "../../../_.spec";

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
    with(component: object | TObjectProto, ...args: unknown[]): ICommandEntityBuilder

    /**
     * Add all components to target entity
     * @param component
     */
    withAll(...component: (object | TObjectProto)[]): ICommandEntityBuilder
}
