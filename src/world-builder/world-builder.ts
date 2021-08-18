import {
    IComponentRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import {IISystemProto, ISystem} from "../system";
import {ISystemInfo, TStates, World} from "../world";
import {TObjectProto} from "../_.spec";
import {SerDe} from "../serde/serde";
import {IIStateProto, State} from "../state";
import {dataStructDeserializer, dataStructSerializer} from "./world-builder.util";


export * from './world-builder.spec';

export class WorldBuilder implements IWorldBuilder {
    protected allSystemsStateSet = new Set<ISystem>();
    protected callbacks: Set<(world: World) => void> = new Set();
    protected name?: string;
    protected serde = new SerDe();
    protected stateInfos: TStates = new Map<IIStateProto, Set<ISystem>>();
    protected systemInfos = new Map<IISystemProto, ISystemInfo>();

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
            states: this.stateInfos,
            systems: new Set(this.systemInfos.values()),
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

    withSystem(System: IISystemProto | ISystem, dependencies?: IISystemProto[]): WorldBuilder {
        const SystemProto = typeof System == 'object'
            ? System.constructor as IISystemProto
            : System;

        /// every system may only be registered once
        if (this.systemInfos.has(SystemProto)) {
            throw new Error(`The system ${System.constructor.name} is already registered!`);
        }

        const system = new SystemProto();

        this.allSystemsStateSet.add(system);
        this.systemInfos.set(SystemProto, {
            system,
            dependencies: new Set(dependencies),
        });

        system.states?.forEach(State => {
            let systemsSet = this.stateInfos.get(State);

            if (!systemsSet) {
                systemsSet = new Set<ISystem>();
            }

            systemsSet.add(system);
            this.stateInfos.set(State, systemsSet);
        });

        return this;
    }
}
