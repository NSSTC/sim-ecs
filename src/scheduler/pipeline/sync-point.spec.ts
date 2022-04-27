import {IStage} from "./stage.spec";
import {ISystem} from "../../system";


export interface ISyncPointPrefab {
    after?: ISyncPointPrefab
    before?: ISyncPointPrefab
    stages?: ISystem<any>[][]
}

export interface ISyncPoint {
    after?: ISyncPoint
    before?: ISyncPoint
    stages: IStage[]

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
     * Execute all sync handlers
     */
    executeOnSyncHandlers(): Promise<ISyncPoint>

    /**
     * Create an execution tree from a schedule-prefab
     * @param prefab
     */
    fromPrefab(prefab: ISyncPointPrefab): ISyncPoint

    /**
     * Remove a sync handler
     * @param handler
     */
    removeOnSyncHandler(handler: Function): ISyncPoint
}
