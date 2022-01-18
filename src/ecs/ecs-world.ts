import {IWorld} from "../world.spec";
import {IWorldBuilder, WorldBuilder} from "../world-builder";
import {SerDe} from "../serde";

const worlds = new Set<IWorld>();

/**
 * Register a world
 * @param world
 */
export function addWorld(world: IWorld) {
    worlds.add(world);
}

/**
 * Build a new world and automatically add it to the list of worlds inside the ECS
 */
export function buildWorld(): IWorldBuilder {
    const serde = new SerDe();
    return new WorldBuilder(serde).addCallback(world => worlds.add(world));
}

/**
 * Find a world with a name
 * @param name
 */
export function findWorld(name: string): IWorld | undefined {
    let world;
    for (world of worlds) {
        if (world.name == name) {
            return world;
        }
    }
}

/**
 * Iterate over all registered worlds
 */
export function getWorlds(): IterableIterator<IWorld> {
    return worlds.values();
}

/**
 * Remove a world
 * @param world
 */
export function removeWorld(world: IWorld) {
    worlds.delete(world);
}
