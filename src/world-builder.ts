import {
    IComponentRegistrationOptions,
    IWorldBuilder,
} from "./world-builder.spec";
import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import IWorld, {TSystemInfo} from "./world.spec";
import {World} from "./world";
import {TDeserializer} from "./save-format.spec";
import {TObjectProto} from "./_.spec";
import {SaveFormat} from "./save-format";

export class WorldBuilder implements IWorldBuilder {
    protected systemInfos: Map<ISystem<TSystemData>, TSystemInfo<TSystemData>> = new Map();
    protected callbacks: Set<(world: IWorld) => void> = new Set();
    protected fromWorld?: World;
    protected save = new SaveFormat();

    addCallback(cb: (world: IWorld) => void): IWorldBuilder {
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

    fromJSON(json: string, deserializer?: TDeserializer): IWorldBuilder {
        this.save.loadJSON(json);
        this.fromWorld = new World(new Map());
        let entity;

        for (entity of this.save.getEntities(deserializer)) {
            this.fromWorld.addEntity(entity);
        }

        return this;
    }

    withSystem(System: TSystemProto<TSystemData>, dependencies?: TSystemProto<TSystemData>[]): IWorldBuilder {
        if (Array.from(this.systemInfos.values()).find(info => info.system.constructor == System)) {
            throw new Error(`The system ${System.constructor.name} is already registered!`);
        }

        const system = new System();

        this.systemInfos.set(system, {
            dataPrototype: system.SystemDataType,
            dataSet: new Set(),
            dependencies: new Set(dependencies),
            system,
        } as TSystemInfo<TSystemData>);

        return this;
    }

    withComponent(Component: TObjectProto, options?: IComponentRegistrationOptions): IWorldBuilder {
        this.save.registerComponent(
            Component,
            options?.serDe?.deserializer ?? dataStructDeserializer.bind(undefined, Component),
            options?.serDe?.serializer ?? dataStructSerializer
        );

        return this;
    }
}

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
