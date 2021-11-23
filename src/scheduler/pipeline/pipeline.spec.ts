import {ISyncPoint} from "./sync-point.spec";

export interface IPipeline {
    readonly root: Readonly<ISyncPoint>

    /**
     * Get all sync groups of this pipeline
     */
    getGroups(): Readonly<Array<Readonly<ISyncPoint>>>
}
