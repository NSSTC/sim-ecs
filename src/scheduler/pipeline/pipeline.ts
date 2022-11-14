import type {IPipeline} from "./pipeline.spec";
import {type ISyncPoint, SyncPoint} from "./sync-point";

export * from "./pipeline.spec";

export class Pipeline implements IPipeline {
    protected _root: ISyncPoint = new SyncPoint();

    get root(): Readonly<ISyncPoint> {
        return this._root;
    }

    getGroups(): ReadonlyArray<Readonly<ISyncPoint>> {
        const orderedPoints: ISyncPoint[] = [];
        const traversePoint = (point: ISyncPoint) => {
            point.before && traversePoint(point.before);
            orderedPoints.push(point);
            point.after && traversePoint(point.after);
        };

        traversePoint(this._root);
        return orderedPoints;
    }
}
