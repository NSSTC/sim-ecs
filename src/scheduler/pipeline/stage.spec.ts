import type {ISystem} from "../../system/system.spec";
import type {TExecutor} from "../../_.spec";
import {IEventBus} from "../../events/event-bus.spec";

export type TStageSchedulingAlgorithm = (systems: ISystem[], eventBus: IEventBus) => Promise<void>;

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
     * @param eventBus
     */
    getExecutor(eventBus: IEventBus): TExecutor
}
