import type {ISyncPoint} from "./sync-point.spec.ts";

export interface IPipeline {
    readonly root: Readonly<ISyncPoint>

    /**
     * Get all sync groups of this pipeline in the correct chronological order
     */
    getGroups(): ReadonlyArray<Readonly<ISyncPoint>>
}
