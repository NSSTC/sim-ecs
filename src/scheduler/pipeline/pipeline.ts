import type {IPipeline} from "./pipeline.spec.ts";
import {type ISyncPoint, SyncPoint} from "./sync-point.ts";

export * from "./pipeline.spec.ts";

export class Pipeline implements IPipeline {
    protected _root: ISyncPoint = new SyncPoint();

    get root(): Readonly<ISyncPoint> {
        return this._root;
    }

    getGroups(): ReadonlyArray<Readonly<ISyncPoint>> {
        const orderedPoints: ISyncPoint[] = [];
        const traversePoint = (point: Readonly<ISyncPoint>) => {
            point.before && traversePoint(point.before);
            orderedPoints.push(point);
            point.after && traversePoint(point.after);
        };

        traversePoint(this._root);
        return orderedPoints;
    }
}
