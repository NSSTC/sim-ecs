import {IScheduler} from "./scheduler.spec";
import {IPipeline, Pipeline} from "./pipeline/pipeline";
import {IStage} from "./pipeline/stage";
import {ISyncPoint} from "./pipeline/sync-point";
import {IStageAction} from "../world.spec";
import {TExecutor} from "../_.spec";

export * from "./scheduler.spec";


export async function defaultSchedulingAlgorithm(stageExecutors: TExecutor[]) {
    const setPromises = [];
    let stageExecutor;

    for (stageExecutor of stageExecutors) {
        setPromises.push(stageExecutor());
    }

    await Promise.all(setPromises);
}

export class Scheduler implements IScheduler {
    protected _groups?: Readonly<Array<Readonly<ISyncPoint>>>;
    protected _isManuallyPrepared = false;
    protected _isPrepared = false;
    protected _pipeline: IPipeline = new Pipeline();
    schedulingAlgorithm = defaultSchedulingAlgorithm;
    protected _stageSets?: IStage[][];

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

    getExecutor(actions: IStageAction): TExecutor {
        const stageExecutors: TExecutor[] = [];

        for (const group of this._pipeline.getGroups()) {
            for (const stage of group.stages) {
                stageExecutors.push(stage.getExecutor(actions));
            }
        }

        return () => this.schedulingAlgorithm(stageExecutors);
    }
}
