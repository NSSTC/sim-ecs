import {IScheduler} from "./scheduler.spec";
import {IPipeline, Pipeline} from "./pipeline/pipeline";
import {IStage} from "./pipeline/stage";
import {ISyncPoint} from "./pipeline/sync-point";
import {ISystemActions} from "../world.spec";

export * from "./scheduler.spec";


export async function defaultSchedulingAlgorithm(actions: ISystemActions, stageSet: IStage[]) {
    const setPromises = [];
    let stage;

    for (stage of stageSet) {
        setPromises.push(stage.execute(actions));
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

    get currentPipeline(): IPipeline {
        return this._pipeline;
    }

    async execute(actions: ISystemActions): Promise<void> {
        this.prepare(false);

        {
            let stageSet;

            for (stageSet of this._stageSets!) {
                await this.schedulingAlgorithm(actions, stageSet);
            }
        }

        this.unprepare(false);
    }

    prepare(manual = true): void {
        if (!manual && this._isManuallyPrepared) {
            return;
        }

        if (this._isPrepared) {
            throw new Error('This pipeline was already prepared!');
        }

        this._groups = this._pipeline.getGroups();
        this._stageSets = this._groups.map(group => {
            group.lock();
            return group.stages;
        });

        if (manual) {
            this._isManuallyPrepared = true;
        }

        this._isPrepared = true;
    }

    setPipeline(newPipeline: IPipeline): void {
        if (this._isPrepared) {
            throw new Error('This scheduler was already prepared or is executing and cannot be changed right now!');
        }

        this._pipeline = newPipeline;
    }

    unprepare(manual = true): void {
        if (!manual && this._isManuallyPrepared) {
            return;
        }

        if (!this._isPrepared) {
            throw new Error('This stage was not prepared, yet!');
        }

        if (manual && !this._isManuallyPrepared) {
            throw new Error('This stage was not manually prepared!');
        }

        this._groups!.forEach(group => group.unlock());
        this._groups = undefined;
        this._stageSets = undefined;

        this._isManuallyPrepared = false;
        this._isPrepared = false;
    }
}
