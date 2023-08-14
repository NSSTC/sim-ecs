import type {
    IObjectRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec.ts";
import type {TObjectProto} from "../_.spec.ts";
import type {ISerDe} from "../serde/serde.spec.ts";
import {dataStructDeserializer, dataStructSerializer} from "./world-builder.util.ts";
import {type IScheduler, Scheduler} from "../scheduler/scheduler.ts";
import type {ISyncPoint} from "../scheduler/pipeline/sync-point.spec.ts";
import type {IIStateProto} from "../state/state.spec.ts";
import {addSyncPoint} from "../ecs/ecs-sync-point.ts";
import {PreptimeWorld} from "./preptime/preptime-world.ts";
import type {IResourceRegistrationOptions} from "./world-builder.spec.ts";

export * from './world-builder.spec.ts';

export class WorldBuilder implements IWorldBuilder {
    protected callbacks = new Set<(world: PreptimeWorld) => void>();
    protected worldName?: string;
    protected defaultScheduler: Readonly<IScheduler> = new Scheduler();
    protected resources = new Map<Readonly<TObjectProto>, ReadonlyArray<unknown>>();
    protected stateSchedulers = new Map<IIStateProto, Readonly<IScheduler>>();

    constructor(
        protected serde: Readonly<ISerDe>,
    ) {}

    addCallback(cb: (world: Readonly<PreptimeWorld>) => void): WorldBuilder {
        this.callbacks.add(cb);
        return this;
    }

    build(): PreptimeWorld {
        const world = new PreptimeWorld(
            this.worldName,
            {
                defaultScheduler: this.defaultScheduler!,
                serde: this.serde,
                stateSchedulers: this.stateSchedulers,
            },
            {
                resources: this.resources,
            }
        );

        for (const cb of this.callbacks) {
            cb(world);
        }

        return world;
    }

    protected checkSyncPointLoop(root: Readonly<ISyncPoint>): void {
        if (this.hasSyncPointLoop(root)) {
            throw new Error('The sync-points provided form a loop!');
        }
    }

    protected hasSyncPointLoop(root: Readonly<ISyncPoint>): boolean {
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

        return check(root, 'before');
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

    withComponent(Component: TObjectProto, options?: Readonly<IObjectRegistrationOptions>): WorldBuilder {
        this.serde.registerTypeHandler(
            Component,
            options?.serDe?.deserializer ?? dataStructDeserializer.bind(undefined, Component),
            options?.serDe?.serializer ?? dataStructSerializer
        );

        return this;
    }

    withComponents(...Components: ReadonlyArray<TObjectProto>): WorldBuilder {
        for (const Component of Components) {
            this.withComponent(Component);
        }

        return this;
    }

    withDefaultScheduler(scheduler: Readonly<IScheduler>): IWorldBuilder {
        const root = scheduler.pipeline.root;

        this.checkSyncPointLoop(root);
        this.defaultScheduler = scheduler;
        this.registerAllNamedSyncPoints(root);

        return this;
    }

    withDefaultScheduling(planner: (root: ISyncPoint) => void): WorldBuilder {
        const root = this.defaultScheduler.pipeline.root;

        this.checkSyncPointLoop(root);
        planner(root);
        this.registerAllNamedSyncPoints(root);

        return this;
    }

    withName(name: string): WorldBuilder {
        this.worldName = name;
        return this;
    }

    withResource(Resource: TObjectProto, options?: Readonly<Partial<IResourceRegistrationOptions>>): WorldBuilder {
        this.resources.set(Resource, options?.constructorArgs ?? []);
        this.serde.registerTypeHandler(
            Resource,
            options?.serDe?.deserializer ?? dataStructDeserializer.bind(undefined, Resource),
            options?.serDe?.serializer ?? dataStructSerializer
        );

        return this;
    }

    withResources(Resources: ReadonlyArray<TObjectProto>): WorldBuilder {
        for (const Resource of Resources) {
            this.withResource(Resource);
        }

        return this;
    }

    withStateScheduler(state: IIStateProto, scheduler: Readonly<IScheduler>): WorldBuilder {
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

    /// ****************************************************************************************************************
    /// Aliases
    /// ****************************************************************************************************************

    public c = this.withComponent;
    public component = this.withComponent;
    public components = this.withComponents;

    public name = this.withName;

    public r = this.withResource;
    public resource = this.withResource;
}
