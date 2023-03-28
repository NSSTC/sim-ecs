import type {ISyncPoint} from "../scheduler/pipeline/sync-point.spec.ts";

const syncPoints = new Map<string, ISyncPoint>();

/**
 * Register a sync-point by name
 * @param syncPoint
 */
export function addSyncPoint(syncPoint: Readonly<ISyncPoint>): void {
    if (!syncPoint.name) {
        throw new Error('Cannot register a sync point without a name!');
    }

    {
        const name = syncPoint.name;

        if (syncPoints.has(name) && syncPoints.get(name) != syncPoint) {
            throw new Error(`Another sync point with the name "${name}" has already been registered!`);
        }

        syncPoints.set(name, syncPoint);
    }
}

/**
 * Find a sync-point by name, if it exists
 * @param name
 */
export function getSyncPoint(name: string): ISyncPoint | undefined {
    return syncPoints.get(name);
}

/**
 * Remove a sync-point from the registry by name, if it exists
 * @param name
 */
export function removeSyncPoint(name: string): void {
    syncPoints.delete(name);
}
