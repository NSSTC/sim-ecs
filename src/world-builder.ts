import {
    IComponentRegistrationOptions, ISystemRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import IWorld, {TSystemInfo} from "./world.spec";
import {World} from "./world";
import {TObjectProto} from "./_.spec";
import {SerDe} from "./serde/serde";
import ECS from "./ecs";

export class WorldBuilder implements IWorldBuilder {
    protected callbacks: Set<(world: IWorld) => void> = new Set();
    protected serde = new SerDe();
    protected systemInfos: Map<ISystem<TSystemData>, TSystemInfo<TSystemData>> = new Map();

    constructor(
        protected ecs: ECS,
    ) {}

    addCallback(cb: (world: IWorld) => void): WorldBuilder {
        this.callbacks.add(cb);
        return this;
    }

    build(): IWorld {
        const world = new World(this.ecs, this.systemInfos, this.serde);

        for (const cb of this.callbacks) {
            cb(world);
        }

        return world;
    }

    withSystem(System: TSystemProto<TSystemData>, options?: ISystemRegistrationOptions | TSystemProto<TSystemData>[]): WorldBuilder {
        if (Array.from(this.systemInfos.values()).find(info => info.system.constructor == System)) {
            throw new Error(`The system ${System.constructor.name} is already registered!`);
        }

        let dependencies;

        if (Array.isArray(options)) {
            dependencies = options;
        }
        else if (!!options) {
            dependencies = options.dependencies ?? [];
        }

        const system = new System();

        this.systemInfos.set(system, {
            dataPrototype: system.SystemDataType,
            dataSet: new Set(),
            dependencies: new Set(dependencies),
            system,
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
