import {
    IComponentRegistrationOptions, ISystemRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import IWorld, {TSystemInfo} from "./world.spec";
import {World} from "./world";
import {TDeserializer} from "./save-format.spec";
import {TObjectProto} from "./_.spec";
import {SaveFormat} from "./save-format";

export class WorldBuilder implements IWorldBuilder {
    protected callbacks: Set<(world: IWorld) => void> = new Set();
    protected fromWorld?: World;
    protected save = new SaveFormat();
    protected systemInfos: Map<ISystem<TSystemData>, TSystemInfo<TSystemData>> = new Map();

    addCallback(cb: (world: IWorld) => void): WorldBuilder {
        this.callbacks.add(cb);
        return this;
    }

    build(): IWorld {
        const world = new World(this.systemInfos);

        world.setSaveFormat(this.save);

        if (this.fromWorld) {
            world.merge(this.fromWorld);
        }

        for (const cb of this.callbacks) {
            cb(world);
        }

        return world;
    }

    fromJSON(json: string, deserializer?: TDeserializer): WorldBuilder {
        this.save.loadJSON(json);
        this.fromWorld = new World(new Map());
        let entity;

        for (entity of this.save.getEntities(deserializer)) {
            this.fromWorld.addEntity(entity);
        }

        return this;
    }

    withSystem(System: TSystemProto<TSystemData>, options?: ISystemRegistrationOptions | TSystemProto<TSystemData>[]): WorldBuilder {
        if (Array.from(this.systemInfos.values()).find(info => info.system.constructor == System)) {
            throw new Error(`The system ${System.constructor.name} is already registered!`);
        }

        let dependencies;
        // todo: read from options and thread to service workers if true in order spread a single system's workload
        let parallelize = false;

        if (Array.isArray(options)) {
            dependencies = options;
        }
        else if (!!options) {
            dependencies = options.dependencies ?? [];
            parallelize = !!options.parallelize;
        }

        const system = new System();

        this.systemInfos.set(system, {
            dataPrototype: system.SystemDataType,
            dataSet: new Set(),
            dependencies: new Set(dependencies),
            parallelize,
            system,
        });

        return this;
    }

    withComponent(Component: TObjectProto, options?: IComponentRegistrationOptions): WorldBuilder {
        this.save.registerComponent(
            Component,
            options?.serDe?.deserializer ?? dataStructDeserializer.bind(undefined, Component),
            options?.serDe?.serializer ?? dataStructSerializer
        );

        return this;
    }
}

// todo: read the Constructor parameters in order to throw early if a field is missing
function dataStructDeserializer(Constructor: TObjectProto, data: unknown): Object {
    if (typeof data != 'object') {
        throw new Error(`Cannot default-deserialize data of type ${typeof data}!`);
    }

    const obj: { [key: string]: any } = new Constructor();

    for (const kv of Object.entries(data as Object)) {
        obj[kv[0]] = kv[1];
    }

    return obj;
}

function dataStructSerializer(component: unknown): string {
    return JSON.stringify(component);
}

export const _ = {
    dataStructDeserializer,
    dataStructSerializer,
};
