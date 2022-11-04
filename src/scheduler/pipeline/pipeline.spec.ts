import type {ISyncPoint} from "./sync-point.spec";

export interface IPipeline {
    readonly root: Readonly<ISyncPoint>

    /**
     * Get all sync groups of this pipeline in the correct chronological order
     */
    getGroups(): Readonly<Array<Readonly<ISyncPoint>>>
}
