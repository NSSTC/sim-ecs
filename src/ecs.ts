import {IWorld} from "./world.spec";
import {IWorldBuilder, WorldBuilder} from "./world-builder/world-builder";
import {IEntity} from "./entity.spec";


const entities = new Map<string, IEntity>();
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
    return new WorldBuilder().addCallback(world => worlds.add(world));
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
 * Get a tracked entity
 * @param id
 */
export function getEntity(id: string): IEntity | undefined {
    return entities.get(id);
}

/**
 * Register an entity by its ID
 * Only useful for tracking entities with ID
 * @param entity
 */
export function registerEntity(entity: IEntity) {
    const id = entity.id;

    if (!id) {
        throw new Error('Could not get ID from entity, did you forget to register a generator or pass an ID?');
    }

    entities.set(id, entity);
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
