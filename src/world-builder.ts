import {IWorldBuilder} from "./world-builder.spec";
import ISystem, {TSystemProto} from "./system.spec";
import IWorld, {TSystemInfo} from "./world.spec";
import {World} from "./world";

export class WorldBuilder implements IWorldBuilder {
    protected systemInfos: Map<ISystem<any>, TSystemInfo<any>> = new Map();
    protected callbacks: Set<(world: IWorld)=>void> = new Set();

    addCallback(cb: (world: IWorld)=>void): IWorldBuilder {
        this.callbacks.add(cb);
        return this;
    }

    build(): IWorld {
        const world = new World(this.systemInfos);

        for (const cb of this.callbacks) {
            cb(world);
        }

        return world;
    }

    with(system: ISystem<any>, dependencies?: TSystemProto<any>[]): IWorldBuilder {
        if (Array.from(this.systemInfos.values()).find(info => info.system.constructor == system.constructor)) {
            throw new Error(`The system ${system.constructor.name} is already registered!`);
        }

        this.systemInfos.set(system, {
            dataPrototype: system.SystemDataType,
            dataSet: new Set(),
            dependencies: new Set(dependencies),
            system,
        } as TSystemInfo<any>);

        return this;
    }
}
