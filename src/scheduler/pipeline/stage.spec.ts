import {ISystem} from "../../system";
import {TExecutor} from "../../_.spec";
import {World} from "../../world";

export type TStageSchedulingAlgorithm = (world: World, systems: ISystem[]) => Promise<void>;

export interface IStage {
    schedulingAlgorithm: TStageSchedulingAlgorithm
    systems: ISystem[]

    /**
     * Append a system to this stage
     * @param system
     */
    addSystem(system: ISystem<any>): IStage

    /**
     * Get executor to run this stage once
     * @param world
     */
    getExecutor(world: World): TExecutor
}
