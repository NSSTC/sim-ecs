import { TSystemProto} from "./system.spec";
import IWorld from "./world.spec";
import {TObjectProto} from "./_.spec";
import {ISerDeOperations} from "./serde/serde.spec";

export interface IComponentRegistrationOptions {
    serDe: ISerDeOperations
}

export interface IWorldBuilder {
    /**
     * Build the execution unit
     */
    build(): IWorld

    /**
     * Add system to the world
     * @param System
     * @param dependencies
     */
    withSystem(System: TSystemProto, dependencies?: TSystemProto[]): IWorldBuilder

    /**
     * Register a component in the world
     * @param Component
     * @param options
     */
    withComponent(Component: TObjectProto, options?: IComponentRegistrationOptions): IWorldBuilder

    /**
     * Register several components with default options in the world
     * @param Components
     */
    withComponents(...Components: TObjectProto[]): IWorldBuilder
}
