import {type IWorldBuilder, WorldBuilder} from "../world/world-builder";
import {SerDe} from "../serde/serde";
import type {IPreptimeWorld} from "../world/preptime/preptime-world.spec";
import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec";

const worlds = new Set<IPreptimeWorld | IRuntimeWorld>();

/**
 * Register a world
 * @param world
 */
export function addWorld(world: IPreptimeWorld | IRuntimeWorld) {
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
 * Get a world with a name
 * @param name
 */
export function getWorld(name: string): IPreptimeWorld | IRuntimeWorld | undefined {
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
export function getWorlds(): IterableIterator<IPreptimeWorld | IRuntimeWorld> {
    return worlds.values();
}

/**
 * Remove a world
 * @param world
 */
export function removeWorld(world: IPreptimeWorld | IRuntimeWorld) {
    worlds.delete(world);
}
