import {IWorldBuilder} from "./world-builder.spec";
import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import IWorld, {TSystemInfo} from "./world.spec";
import {World} from "./world";
import {TDeserializer} from "./save-format.spec";

export class WorldBuilder implements IWorldBuilder {
    protected systemInfos: Map<ISystem<TSystemData>, TSystemInfo<TSystemData>> = new Map();
    protected callbacks: Set<(world: IWorld)=>void> = new Set();
    protected fromWorld?: World;

    addCallback(cb: (world: IWorld)=>void): IWorldBuilder {
        this.callbacks.add(cb);
        return this;
    }

    build(): IWorld {
        const world = new World(this.systemInfos);

        if (this.fromWorld) {
            world.merge(this.fromWorld);
        }

        for (const cb of this.callbacks) {
            cb(world);
        }

        return world;
    }

    fromJSON(json: string, deserializer: TDeserializer): IWorldBuilder {
        this.fromWorld = World.fromJSON(json, deserializer);
        return this;
    }

    with(system: ISystem<TSystemData>, dependencies?: TSystemProto<TSystemData>[]): IWorldBuilder {
        if (Array.from(this.systemInfos.values()).find(info => info.system.constructor == system.constructor)) {
            throw new Error(`The system ${system.constructor.name} is already registered!`);
        }

        this.systemInfos.set(system, {
            dataPrototype: system.SystemDataType,
            dataSet: new Set(),
            dependencies: new Set(dependencies),
            system,
        } as TSystemInfo<TSystemData>);

        return this;
    }
}
