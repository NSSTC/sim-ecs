import {
    IComponentRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import {ISystem} from "../system";
import {TStates, World} from "../world";
import {TObjectProto} from "../_.spec";
import {SerDe} from "../serde/serde";
import {IIStateProto, State} from "../state";
import {dataStructDeserializer, dataStructSerializer} from "./world-builder.util";
import {IScheduler, Scheduler} from "../scheduler/scheduler";
import {ISyncPoint} from "../scheduler/pipeline/sync-point.spec";


export * from './world-builder.spec';

export class WorldBuilder implements IWorldBuilder {
    protected allSystemsStateSet = new Set<ISystem>();
    protected callbacks: Set<(world: World) => void> = new Set();
    protected name?: string;
    protected scheduler: IScheduler = new Scheduler();
    protected serde = new SerDe();
    protected stateInfos: TStates = new Map<IIStateProto, Set<ISystem>>();

    constructor() {
        this.stateInfos.set(State, this.allSystemsStateSet);
    }

    addCallback(cb: (world: World) => void): WorldBuilder {
        this.callbacks.add(cb);
        return this;
    }

    build(): World {
        const world = new World({
            name: this.name,
            scheduler: this.scheduler,
            states: this.stateInfos,
            serde: this.serde,
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

    withName(name: string): WorldBuilder {
        this.name = name;
        return this;
    }

    withScheduler(scheduler: IScheduler): IWorldBuilder {
        this.scheduler = scheduler;
        return this;
    }

    withScheduling(planner: (root: ISyncPoint) => void): WorldBuilder {
        planner(this.scheduler.currentPipeline.root);
        return this;
    }
}
