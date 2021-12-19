import {
    IComponentRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import {ISystem} from "../system";
import {World} from "../world";
import {TObjectProto} from "../_.spec";
import {SerDe} from "../serde/serde";
import {dataStructDeserializer, dataStructSerializer} from "./world-builder.util";
import {IScheduler, Scheduler} from "../scheduler/scheduler";
import {ISyncPoint} from "../scheduler/pipeline/sync-point.spec";
import {IIStateProto} from "../state.spec";


export * from './world-builder.spec';

export class WorldBuilder implements IWorldBuilder {
    protected allSystemsStateSet = new Set<ISystem>();
    protected callbacks: Set<(world: World) => void> = new Set();
    protected name?: string;
    protected defaultScheduler: IScheduler = new Scheduler();
    protected serde = new SerDe();
    protected stateSchedulers = new Map<IIStateProto, IScheduler>();

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
        this.defaultScheduler = scheduler;
        return this;
    }

    withName(name: string): WorldBuilder {
        this.name = name;
        return this;
    }

    withDefaultScheduling(planner: (root: ISyncPoint) => void): WorldBuilder {
        planner(this.defaultScheduler.pipeline.root);
        return this;
    }

    withStateScheduler(state: IIStateProto, scheduler: IScheduler): WorldBuilder {
        if (this.stateSchedulers.has(state)) {
            throw new Error(`A scheduler was already assigned to ${state.name}!`);
        }

        this.stateSchedulers.set(state, scheduler);
        return this;
    }

    withStateScheduling(state: IIStateProto, planner: (root: ISyncPoint) => void): WorldBuilder {
        if (this.stateSchedulers.has(state)) {
            throw new Error(`A scheduler was already assigned to ${state.name}!`);
        }

        {
            const scheduler = new Scheduler();
            this.stateSchedulers.set(state, scheduler);
            planner(scheduler.pipeline.root);
        }

        return this;
    }
}
