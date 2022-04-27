import {ISyncPoint, ISyncPointPrefab} from "./sync-point.spec";
import {IStage, Stage} from "./stage";
import {ISystem} from "../../system";

export * from "./sync-point.spec";

export class SyncPoint implements ISyncPoint {
    after?: ISyncPoint;
    before?: ISyncPoint;
    stages: IStage[] = [];
    protected syncPointHandlers = new Set<Function>();

    addNewStage(handler: (stage: IStage) => void): SyncPoint {
        const stage = new Stage();
        this.stages.push(stage);
        handler(stage);
        return this;
    }

    addOnSyncHandler(handler: Function): SyncPoint {
        this.syncPointHandlers.add(handler);
        return this;
    }

    async executeOnSyncHandlers(): Promise<SyncPoint> {
        let handler;

        for (handler of this.syncPointHandlers) {
            await handler();
        }

        return this;
    }

    fromPrefab({after, before, stages = []}: ISyncPointPrefab): SyncPoint {
        this.after = after
            ? new SyncPoint().fromPrefab(after)
            : undefined;
        this.before = before
            ? new SyncPoint().fromPrefab(before)
            : undefined;
        this.stages.length = 0;

        {
            let stage: ISystem[];
            let system: ISystem;
            for (stage of stages) {
                this.addNewStage(newStage => {
                    for (system of stage) {
                        newStage.addSystem(system);
                    }
                });
            }
        }

        return this;
    }

    removeOnSyncHandler(handler: Function): SyncPoint {
        this.syncPointHandlers.delete(handler);
        return this;
    }
}
