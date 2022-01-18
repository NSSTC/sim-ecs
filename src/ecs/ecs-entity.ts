import {IEntity} from "../entity.spec";

const entities = new Map<string, IEntity>();

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
