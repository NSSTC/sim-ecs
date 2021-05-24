import {TSystemData, TSystemProto} from "./system.spec";
import IWorld from "./world.spec";
import {TObjectProto} from "./_.spec";
import {ISerDeOperations} from "./serde/serde.spec";

export interface IComponentRegistrationOptions {
    serDe: ISerDeOperations
}

export interface ISystemRegistrationOptions {
    dependencies?: TSystemProto<TSystemData>[]
}

export interface IWorldBuilder {
    /**
     * Build the execution unit
     */
    build(): IWorld

    /**
     * Add system to the world
     * @param System
     * @param optionsOrDependencies
     */
    withSystem(System: TSystemProto<TSystemData>, optionsOrDependencies?: ISystemRegistrationOptions | TSystemProto<TSystemData>[]): IWorldBuilder

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
