import {IEntity} from "../entity.spec";

const entities = new Map<string, WeakRef<IEntity>>();


/**
 * Remove any referenced deleted entities
 */
export function cleanRegistry(): void {
    let entityRef;
    let entityId;

    for ([entityId, entityRef] of entities.entries()) {
        if (!entityRef.deref()) {
            entities.delete(entityId);
        }
    }
}

/**
 * Get a tracked entity
 * @param id
 */
export function getEntity(id: string): IEntity | undefined {
    return entities.get(id)?.deref();
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

    entities.set(id, new WeakRef(entity));
}

/**
 * Remove an entity and reset its ID
 * @param entity
 */
export function unregisterEntity(entity: IEntity): void {
    if (!entity.hasId()) {
        return;
    }

    entities.delete(entity.id!);
    entity.removeId(false);
}
