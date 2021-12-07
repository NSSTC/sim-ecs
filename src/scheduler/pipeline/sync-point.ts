import {ISyncPoint} from "./sync-point.spec";
import {IStage, Stage} from "./stage";

export * from "./sync-point.spec";

export class SyncPoint implements ISyncPoint {
    after?: ISyncPoint;
    before?: ISyncPoint;
    protected _locked = false;
    stages: IStage[] = [];

    get locked() {
        return this._locked;
    }

    addNewStage(handler: (stage: IStage) => void): SyncPoint {
        const stage = new Stage();
        this.stages.push(stage);
        handler(stage);
        return this;
    }

    lock(): void {
        if (this._locked) {
            throw new Error('This sync point is already locked!');
        }

        this._locked = true;
    }

    unlock(): void {
        this._locked = false;
    }
}
