import {ISyncPoint} from "./sync-point.spec";
import {IStage, Stage} from "./stage";

export * from "./sync-point.spec";

export class SyncPoint implements ISyncPoint {
    after?: ISyncPoint;
    before?: ISyncPoint;
    stages: IStage[] = [];

    addNewStage(handler: (stage: IStage) => void): SyncPoint {
        const stage = new Stage();
        this.stages.push(stage);
        handler(stage);
        return this;
    }
}
