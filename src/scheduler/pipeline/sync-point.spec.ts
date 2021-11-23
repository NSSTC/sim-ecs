import {IStage} from "./stage.spec";

export interface ISyncPoint {
    after?: ISyncPoint
    before?: ISyncPoint
    readonly locked: boolean
    stages: IStage[]

    /**
     * Lock this group
     */
    lock(): void

    /**
     * Unlock this group
     */
    unlock(): void
}
