import {IWorld} from "./world";
import {IWorldBuilder} from "./world-builder.spec";
import {WorldBuilder} from "./world-builder";


type TWorldInfo = {
    name?: string
    world: IWorld
};

export class ECS {
    protected worlds: Set<TWorldInfo> = new Set();

    buildWorld(name?: string): IWorldBuilder {
        return (new WorldBuilder()).addCallback(world => this.worlds.add({ name, world }));
    }
}

export default ECS;
