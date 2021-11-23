import {IPipeline} from "./pipeline/pipeline.spec";
import {ISystemActions} from "../world.spec";
import {IStage} from "./pipeline/stage.spec";

export type TSchedulingAlgorithm = (actions: ISystemActions, stages: IStage[]) => Promise<void>;

export interface IScheduler {
    readonly isPrepared: boolean
    readonly currentPipeline: IPipeline
    schedulingAlgorithm: TSchedulingAlgorithm

    /**
     * Execute this schedule once
     */
    execute(actions: ISystemActions): Promise<void>

    /**
     * Prepare an execution beforehand; in this case the execution has to be unprepared manually
     */
    prepare(): void

    /**
     * Switch out the pipeline
     * @param newPipeline
     */
    setPipeline(newPipeline: IPipeline): void

    /**
     * Unprepare an execution after having it prepared beforehand
     */
    unprepare(): void
}
