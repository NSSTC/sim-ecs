import {IScheduler} from "./scheduler.spec";
import {IPipeline, Pipeline} from "./pipeline/pipeline";
import {TExecutor} from "../_.spec";
import {World} from "../world";

export * from "./scheduler.spec";


export async function defaultSchedulingAlgorithm(stageExecutors: TExecutor[]) {
    let stageExecutor;
    for (stageExecutor of stageExecutors) {
        await stageExecutor();
    }
}

export class Scheduler implements IScheduler {
    protected _isPrepared = false;
    protected _pipeline: IPipeline = new Pipeline();
    schedulingAlgorithm = defaultSchedulingAlgorithm;

    get isPrepared(): boolean {
        return this._isPrepared;
    }

    get pipeline(): IPipeline {
        return this._pipeline;
    }

    set pipeline(newPipeline: IPipeline) {
        if (this._isPrepared) {
            throw new Error('This scheduler was already prepared or is executing and cannot be changed right now!');
        }

        this._pipeline = newPipeline;
    }

    getExecutor(world: World): TExecutor {
        const stageExecutors: TExecutor[] = [];

        for (const group of this._pipeline.getGroups()) {
            for (const stage of group.stages) {
                stageExecutors.push(stage.getExecutor(world));
            }
        }

        return () => this.schedulingAlgorithm(stageExecutors);
    }
}
