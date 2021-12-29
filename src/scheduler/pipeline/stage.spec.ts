import {IStageAction, ISystemActions} from "../../world.spec";
import {ISystem} from "../../system";
import {TExecutor} from "../../_.spec";

export type TSchedulingAlgorithm = (actions: ISystemActions, systems: ISystem[]) => Promise<void>;

export interface IStage {
    schedulingAlgorithm: TSchedulingAlgorithm
    systems: ISystem[]

    /**
     * Append a system to this stage
     * @param system
     */
    addSystem(system: ISystem<any>): IStage

    /**
     * Get executor to run this stage once
     * @param actions
     */
    getExecutor(actions: IStageAction): TExecutor
}
