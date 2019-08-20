import {World} from "./world";

export class ECS {
    protected worlds: World[] = [];

    createWorld(): World {
        const world = new World();
        this.worlds.push(world);
        return world;
    }
}

export default ECS;
