import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import IWorld from "./world.spec";
import {TDeserializer} from "./save-format.spec";

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
    with(system: ISystem<TSystemData>, dependencies?: TSystemProto<TSystemData>[]): IWorldBuilder
}
