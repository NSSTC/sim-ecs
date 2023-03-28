import type {IStage} from "./stage.spec.ts";
import type {ISystem} from "../../system/system.spec.ts";


export interface ISyncPointPrefab {
    name?: string
    after?: ISyncPointPrefab
    before?: ISyncPointPrefab
    stages?: Array<Array<Readonly<ISystem<any>>>>
}

export interface ISyncPoint {
    after?: ISyncPoint
    before?: ISyncPoint
    name?: string
    stages: Array<IStage>

    /**
     * Add a stage to this group
     */
    addNewStage(handler: (stage: IStage) => void): ISyncPoint

    /**
     * Add a handler which is called when the sync-point is done and all activities are finished
     * @param handler
     */
    addOnSyncHandler(handler: Function): ISyncPoint

    /**
     * Remove all sync handlers
     */
    clearOnSyncHandlers(): ISyncPoint

    /**
     * Execute all sync handlers
     */
    executeOnSyncHandlers(): Promise<ISyncPoint>

    /**
     * Create an execution tree from a schedule-prefab
     * @param prefab
     */
    fromPrefab(prefab: Readonly<ISyncPointPrefab>): ISyncPoint

    /**
     * Remove a sync handler
     * @param handler
     */
    removeOnSyncHandler(handler: Function): ISyncPoint
}
