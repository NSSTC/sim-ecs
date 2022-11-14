import type {
    IObjectRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import type {TObjectProto} from "../_.spec";
import type {ISerDe} from "../serde/serde.spec";
import {dataStructDeserializer, dataStructSerializer} from "./world-builder.util";
import {type IScheduler, Scheduler} from "../scheduler/scheduler";
import type {ISyncPoint} from "../scheduler/pipeline/sync-point.spec";
import type {IIStateProto} from "../state/state.spec";
import {addSyncPoint} from "../ecs/ecs-sync-point";
import {PreptimeWorld} from "./preptime/preptime-world";
import {IResourceRegistrationOptions} from "./world-builder.spec";


export * from './world-builder.spec';

export class WorldBuilder implements IWorldBuilder {
    protected callbacks = new Set<(world: PreptimeWorld) => void>();
    protected worldName?: string;
    protected defaultScheduler: IScheduler = new Scheduler();
    protected resources = new Map<TObjectProto, Array<unknown>>();
    protected stateSchedulers = new Map<IIStateProto, IScheduler>();

    constructor(
        protected serde: ISerDe,
    ) {}

    addCallback(cb: (world: PreptimeWorld) => void): WorldBuilder {
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

    c(Component: TObjectProto, options?: IObjectRegistrationOptions): WorldBuilder {
        return this.withComponent(Component, options);
    }

    protected checkSyncPointLoop(root: ISyncPoint): void {
        if (this.hasSyncPointLoop(root)) {
            throw new Error('The sync-points provided form a loop!');
        }
    }

    component(Component: TObjectProto, options?: IObjectRegistrationOptions): WorldBuilder {
        return this.withComponent(Component, options);
    }

    components(...Components: TObjectProto[]): WorldBuilder {
        return this.withComponents(...Components);
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

    name(name: string): WorldBuilder {
        return this.withName(name);
    }

    r(Resource: TObjectProto, options?: Partial<IResourceRegistrationOptions>): IWorldBuilder {
        return this.withResource(Resource, options);
    }

    resource(Resource: TObjectProto, options?: Partial<IResourceRegistrationOptions>): IWorldBuilder {
        return this.withResource(Resource, options);
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

    withComponent(Component: TObjectProto, options?: IObjectRegistrationOptions): WorldBuilder {
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

    withResource(Resource: TObjectProto, options?: Partial<IResourceRegistrationOptions>): WorldBuilder {
        this.resources.set(Resource, options?.constructorArgs ?? []);
        this.serde.registerTypeHandler(
            Resource,
            options?.serDe?.deserializer ?? dataStructDeserializer.bind(undefined, Resource),
            options?.serDe?.serializer ?? dataStructSerializer
        );

        return this;
    }

    withResources(Resources: TObjectProto[]): WorldBuilder {
        for (const Resource of Resources) {
            this.withResource(Resource);
        }

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


// Change alias refs for better performance

WorldBuilder.prototype.c = WorldBuilder.prototype.withComponent;
WorldBuilder.prototype.component = WorldBuilder.prototype.withComponent;
WorldBuilder.prototype.components = WorldBuilder.prototype.withComponents;
WorldBuilder.prototype.name = WorldBuilder.prototype.withName;
WorldBuilder.prototype.r = WorldBuilder.prototype.withResource;
WorldBuilder.prototype.resource = WorldBuilder.prototype.withResource;
