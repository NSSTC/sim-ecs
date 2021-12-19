import {ISystem} from "../../system.spec";
import {IStageAction, ISystemActions} from "../../world.spec";
import {ISystemProto} from "../../system";
import {TExecutor} from "../../_.spec";

export type TSchedulingAlgorithm = (actions: ISystemActions, systems: ISystem[]) => Promise<void>;

export interface IStage {
    schedulingAlgorithm: TSchedulingAlgorithm
    systemProtos: ISystemProto[]

    /**
     * Append a system to this stage
     * @param system
     */
    addSystem(system: ISystemProto): IStage

    /**
     * Get executor to run this stage once
     * @param actions
     */
    getExecutor(actions: IStageAction): TExecutor
}
