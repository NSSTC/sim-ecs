import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import IWorld from "./world.spec";
import {TCustomDeserializer, TDeserializer, TSerializer} from "./save-format.spec";
import {TObjectProto} from "./_.spec";

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
     * @param system
     * @param dependencies
     */
    withSystem(system: ISystem<TSystemData>, dependencies?: TSystemProto<TSystemData>[]): IWorldBuilder

    /**
     * Add component to the world (used for loading and saving)
     * @param Component
     * @param deserializer
     * @param serializer
     */
    withComponent(Component: TObjectProto, deserializer: TCustomDeserializer, serializer?: TSerializer): IWorldBuilder
}
