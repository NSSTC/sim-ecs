import {IStage} from "./stage.spec";

export interface ISyncPoint {
    after?: ISyncPoint
    before?: ISyncPoint
    stages: IStage[]

    /**
     * Add a stage to this group
     */
    addNewStage(handler: (stage: IStage) => void): ISyncPoint
}
