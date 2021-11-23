import {ISyncPoint} from "./sync-point.spec";
import {IStage} from "./stage";

export * from "./sync-point.spec";

export class SyncPoint implements ISyncPoint {
    after?: ISyncPoint;
    before?: ISyncPoint;
    protected _locked = false;
    stages: IStage[] = [];

    get locked() {
        return this._locked;
    }

    lock() {
        if (this._locked) {
            throw new Error('This sync point is already locked!');
        }

        this._locked = true;
    }

    unlock() {
        this._locked = false;
    }
}
