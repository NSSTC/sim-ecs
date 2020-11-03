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
     * @param options
     */
    withSystem(System: TSystemProto<TSystemData>, options?: ISystemRegistrationOptions | TSystemProto<TSystemData>[]): IWorldBuilder

    /**
     * Add component to the world (used for loading and saving)
     * @param Component
     * @param options
     */
    withComponent(Component: TObjectProto, options?: IComponentRegistrationOptions): IWorldBuilder
}
