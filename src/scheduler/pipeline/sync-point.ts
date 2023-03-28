import type {ISyncPoint, ISyncPointPrefab} from "./sync-point.spec.ts";
import {type IStage, Stage} from "./stage.ts";
import type {ISystem} from "../../system/system.spec.ts";

export * from "./sync-point.spec.ts";

export class SyncPoint implements ISyncPoint {
    public after?: ISyncPoint;
    public before?: ISyncPoint;
    public name?: string
    public stages: Array<IStage> = [];
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

    clearOnSyncHandlers(): ISyncPoint {
        this.syncPointHandlers.clear();
        return this;
    }

    async executeOnSyncHandlers(): Promise<SyncPoint> {
        let handler;

        for (handler of this.syncPointHandlers) {
            await handler();
        }

        return this;
    }

    fromPrefab({after, before, stages = []}: Readonly<ISyncPointPrefab>): SyncPoint {
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
