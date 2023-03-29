import {type IWorldBuilder, WorldBuilder} from "../world/world-builder.ts";
import {SerDe} from "../serde/serde.ts";
import type {IPreptimeWorld} from "../world/preptime/preptime-world.spec.ts";
import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec.ts";
import type {ISystem} from "../system/system.spec.ts";
import {PreptimeWorld} from "../world/preptime/preptime-world.ts";

const worlds = new Set<IPreptimeWorld | IRuntimeWorld>();

/**
 * Register a world
 * @param world
 */
export function addWorld(world: Readonly<IPreptimeWorld | IRuntimeWorld>) {
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

export function hmrSwapSystem(system: ISystem): void {
    let world;
    let ptWorld;

    for (world of worlds) {
        if (world instanceof PreptimeWorld) {
            for (ptWorld of world.getExistingRuntimeWorlds()) {
                ptWorld.hmrReplaceSystem(system);
            }
        }
    }
}

/**
 * Remove a world
 * @param world
 */
export function removeWorld(world: Readonly<IPreptimeWorld | IRuntimeWorld>) {
    worlds.delete(world);
}
