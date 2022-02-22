import type {IPipeline} from "./pipeline/pipeline.spec";
import type {TExecutor} from "../_.spec";
import type {World} from "../world";

export type TSchedulingAlgorithm = (stageExecutors: TExecutor[]) => Promise<void>;

/**
 * The sim-ecs scheduler works by breaking down scheduling in a way which makes it simple to define a pipeline and
 * extend it in unpredictable ways (for example by 3rd party plugins). This is possible by assigning Systems to stages
 * (which can have their own scheduling logic each), which are then assigned to named "sync-points".
 * These are constructs which can be hooked into later on easily. A pipeline is then created of all sync-points and a
 * (custom) scheduling logic is run over it, forming the scheduler.
 */
export interface IScheduler {
    readonly isPrepared: boolean
    pipeline: IPipeline
    schedulingAlgorithm: TSchedulingAlgorithm

    /**
     * Execute this schedule once
     */
    getExecutor(world: World): TExecutor
}
