import {IWorld, World} from "./world";
import {IWorldBuilder} from "./world-builder.spec";
import {WorldBuilder} from "./world-builder";


type TWorldInfo = {
    name?: string
    world: IWorld
};

export class ECS {
    protected worlds: Map<World, TWorldInfo> = new Map();

    buildWorld(name?: string): IWorldBuilder {
        return new WorldBuilder(this).addCallback(world => this.worlds.set(world as World, { name, world }));
    }

    removeWorld(world: IWorld) {
        this.worlds.delete(world as World);
    }
}

export default ECS;
