import ISystem, {TSystemProto} from "./system.spec";
import IWorld from "./world.spec";

export interface IWorldBuilder {
    /**
     * Add system to the world
     * @param system
     * @param dependencies
     */
    with(system: ISystem<any>, dependencies?: TSystemProto<any>[]): IWorldBuilder

    /**
     * Build the execution unit
     */
    build(): IWorld
}
