import {
    IComponentRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import {System, TSystemProto} from "./system";
import {ISystemInfo, World} from "./world";
import {TObjectProto} from "./_.spec";
import {SerDe} from "./serde/serde";


export * from './world-builder.spec';

export class WorldBuilder implements IWorldBuilder {
    protected callbacks: Set<(world: World) => void> = new Set();
    protected name?: string;
    protected serde = new SerDe();
    protected systemInfos = new Map<TSystemProto, ISystemInfo>();


    addCallback(cb: (world: World) => void): WorldBuilder {
        this.callbacks.add(cb);
        return this;
    }

    build(): World {
        const world = new World(this.name, new Set(this.systemInfos.values()), this.serde);

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

    withComponents(...Components: TObjectProto[]): IWorldBuilder {
        for (const Component of Components) {
            this.withComponent(Component);
        }

        return this;
    }

    withName(name: string): WorldBuilder {
        this.name = name;
        return this;
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
