import {ISystem} from "../../system.spec";
import {ISystemActions} from "../../world.spec";

export type TSchedulingAlgorithm = (actions: ISystemActions, systems: ISystem[]) => Promise<void>;

export interface IStage {
    schedulingAlgorithm: TSchedulingAlgorithm
    systems: ISystem[]

    /**
     * Run this stage once
     * @param actions
     */
    execute(actions: ISystemActions): Promise<void>
}
