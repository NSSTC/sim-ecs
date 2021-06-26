import {
    IComponentRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import {System, TSystemProto} from "./system";
import {IWorld, ISystemInfo, World} from "./world";
import {TObjectProto} from "./_.spec";
import {SerDe} from "./serde/serde";
import ECS from "./ecs";

export class WorldBuilder implements IWorldBuilder {
    protected callbacks: Set<(world: IWorld) => void> = new Set();
    protected serde = new SerDe();
    protected systemInfos = new Map<TSystemProto, ISystemInfo>();

    constructor(
        protected ecs: ECS,
    ) {}

    addCallback(cb: (world: IWorld) => void): WorldBuilder {
        this.callbacks.add(cb);
        return this;
    }

    build(): IWorld {
        const world = new World(this.ecs, new Set(this.systemInfos.values()), this.serde);

        for (const cb of this.callbacks) {
            cb(world);
        }

        return world;
    }

    withSystem(System: TSystemProto, dependencies?: TSystemProto[]): WorldBuilder {
        if (this.systemInfos.has(System)) {
            throw new Error(`The system ${System.constructor.name} is already registered!`);
        }

        this.systemInfos.set(System, {
            system: new System() as System,
            dependencies: new Set(dependencies),
        });

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

    withComponents(...Components: TObjectProto[]): IWorldBuilder {
        for (const Component of Components) {
            this.withComponent(Component);
        }

        return this;
    }
}

// todo: read the Constructor parameters in order to throw early if a field is missing
function dataStructDeserializer(Constructor: TObjectProto, data: unknown): Object {
    if (typeof data != 'object') {
        throw new Error(`Cannot default-deserialize ${Constructor.name}, because the data is of type ${typeof data}!`);
    }

    const obj: { [key: string]: any } = new Constructor();

    for (const kv of Object.entries(data as Object)) {
        obj[kv[0]] = kv[1];
    }

    return obj;
}

function dataStructSerializer(component: unknown): unknown {
    return component;
}

export const _ = {
    dataStructDeserializer,
    dataStructSerializer,
};
