import type {
    IComponentRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import {World} from "../world";
import type {TObjectProto} from "../_.spec";
import type {ISerDe} from "../serde";
import {dataStructDeserializer, dataStructSerializer} from "./world-builder.util";
import {type IScheduler, Scheduler} from "../scheduler/scheduler";
import type {ISyncPoint} from "../scheduler/pipeline/sync-point.spec";
import type {IIStateProto} from "../state.spec";
import {addSyncPoint} from "../ecs/ecs-sync-point";


export * from './world-builder.spec';

export class WorldBuilder implements IWorldBuilder {
    protected callbacks: Set<(world: World) => void> = new Set();
    protected name?: string;
    protected defaultScheduler: IScheduler = new Scheduler();
    protected stateSchedulers = new Map<IIStateProto, IScheduler>();

    constructor(
        protected serde: ISerDe,
    ) {}

    addCallback(cb: (world: World) => void): WorldBuilder {
        this.callbacks.add(cb);
        return this;
    }

    build(): World {
        const world = new World({
            name: this.name,
            defaultScheduler: this.defaultScheduler!,
            serde: this.serde,
            stateSchedulers: this.stateSchedulers,
        });

        for (const cb of this.callbacks) {
            cb(world);
        }

        return world;
    }

    protected checkSyncPointLoop(root: ISyncPoint): void {
        if (this.hasSyncPointLoop(root)) {
            throw new Error('The sync-points provided form a loop!');
        }
    }

    protected hasSyncPointLoop(root: ISyncPoint): boolean {
        const check = (root: ISyncPoint, direction: 'after' | 'before') => {
            const syncPoints = new Set<ISyncPoint>();
            let currentSyncPoint = root;
            let lookAheadSyncPoint = currentSyncPoint[direction];

            while (lookAheadSyncPoint) {
                if (syncPoints.has(lookAheadSyncPoint)) {
                    return true;
                }

                currentSyncPoint = lookAheadSyncPoint;
                lookAheadSyncPoint = currentSyncPoint[direction];

                syncPoints.add(currentSyncPoint);
            }

            return false;
        };

        if (check(root, 'after')) {
            return true;
        }

        if (check(root, 'before')) {
            return true;
        }

        return false;
    }

    protected registerAllNamedSyncPoints(root: ISyncPoint) {
        let currentSyncPoint = root;

        // register root
        if (root.name) {
            addSyncPoint(root);
        }

        // register all sync-points before root
        while (currentSyncPoint.before) {
            currentSyncPoint = currentSyncPoint.before;

            if (currentSyncPoint.name) {
                addSyncPoint(currentSyncPoint);
            }
        }

        // reset to root
        currentSyncPoint = root;

        // register all sync-points after root
        while (currentSyncPoint.after) {
            currentSyncPoint = currentSyncPoint.after;

            if (currentSyncPoint.name) {
                addSyncPoint(currentSyncPoint);
            }
        }
    }

    updateRootSyncPoint(updater: (root: ISyncPoint) => void): WorldBuilder {
        updater(this.defaultScheduler.pipeline.root);
        return this;
    }

    withComponent(Component: TObjectProto, options?: IComponentRegistrationOptions): WorldBuilder {
        this.serde.registerTypeHandler(
            Component,
            options?.serDe?.deserializer ?? dataStructDeserializer.bind(undefined, Component),
            options?.serDe?.serializer ?? dataStructSerializer
        );

        return this;
    }

    withComponents(...Components: TObjectProto[]): WorldBuilder {
        for (const Component of Components) {
            this.withComponent(Component);
        }

        return this;
    }

    withDefaultScheduler(scheduler: IScheduler): IWorldBuilder {
        const root = scheduler.pipeline.root;

        this.checkSyncPointLoop(root);
        this.defaultScheduler = scheduler;
        this.registerAllNamedSyncPoints(root);

        return this;
    }

    withName(name: string): WorldBuilder {
        this.name = name;
        return this;
    }

    withDefaultScheduling(planner: (root: ISyncPoint) => void): WorldBuilder {
        const root = this.defaultScheduler.pipeline.root;

        this.checkSyncPointLoop(root);
        planner(root);
        this.registerAllNamedSyncPoints(root);

        return this;
    }

    withStateScheduler(state: IIStateProto, scheduler: IScheduler): WorldBuilder {
        if (this.stateSchedulers.has(state)) {
            throw new Error(`A scheduler was already assigned to ${state.name}!`);
        }

        {
            const root = scheduler.pipeline.root;

            this.checkSyncPointLoop(root);
            this.stateSchedulers.set(state, scheduler);
            this.registerAllNamedSyncPoints(root);
        }

        return this;
    }

    withStateScheduling(state: IIStateProto, planner: (root: ISyncPoint) => void): WorldBuilder {
        if (this.stateSchedulers.has(state)) {
            throw new Error(`A scheduler was already assigned to ${state.name}!`);
        }

        {
            const scheduler = new Scheduler();
            const root = scheduler.pipeline.root;

            this.stateSchedulers.set(state, scheduler);
            planner(root);
            this.checkSyncPointLoop(root);
            this.registerAllNamedSyncPoints(root);
        }

        return this;
    }
}
