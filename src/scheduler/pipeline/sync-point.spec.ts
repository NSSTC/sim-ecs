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
     * Create an execution tree from a schedule-prefab
     * @param prefab
     */
    fromPrefab(prefab: ISyncPointPrefab): ISyncPoint
}
