import {TSystemData, TSystemProto} from "./system.spec";
import IWorld from "./world.spec";
import {ISerDe, TDeserializer} from "./save-format.spec";
import {TObjectProto} from "./_.spec";

export interface IComponentRegistrationOptions {
    serDe: ISerDe
}

export interface ISystemRegistrationOptions {
    dependencies?: TSystemProto<TSystemData>[]
    parallelize?: boolean
}

export interface IWorldBuilder {
    /**
     * Build the execution unit
     */
    build(): IWorld

    /**
     * Load a world from a JSON string
     * @param json
     * @param deserializer
     */
    fromJSON(json: string, deserializer: TDeserializer): IWorldBuilder

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
    withComponents(Components: TObjectProto[]): IWorldBuilder
}
