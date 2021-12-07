import {ISystem} from "../../system.spec";
import {ISystemActions} from "../../world.spec";
import {ISystemProto} from "../../system";

export type TSchedulingAlgorithm = (actions: ISystemActions, systems: ISystem[]) => Promise<void>;

export interface IStage {
    schedulingAlgorithm: TSchedulingAlgorithm
    systems: ISystem[]

    /**
     * Append a system to this stage
     * @param system
     */
    addSystem(system: ISystemProto): IStage

    /**
     * Run this stage once
     * @param actions
     */
    execute(actions: ISystemActions): Promise<void>
}
