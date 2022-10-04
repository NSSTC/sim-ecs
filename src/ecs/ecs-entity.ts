import {IEntity} from "../entity.spec";

const entities = new Map<string, WeakRef<IEntity>>();


/**
 * Remove any referenced deleted entities
 */
export function cleanRegistry(): void {
    let entity;
    let entityRef;

    for (entityRef of entities.values()) {
        entity = entityRef.deref();

        if (entity) {
            unregisterEntity(entity);
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
    entities.set(entity.id, new WeakRef(entity));
}

/**
 * Remove an entity and reset its ID
 * @param entity
 */
export function unregisterEntity(entity: IEntity): void {
    entities.delete(entity.id);
}
