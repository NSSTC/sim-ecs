import type {IEntity, TEntityId} from "../entity/entity.spec.ts";

const entities = new Map<TEntityId, WeakRef<IEntity>>();


/**
 * Remove any referenced deleted entities
 */
export function clearRegistry(): void {
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
export function getEntity(id: TEntityId): IEntity | undefined {
    return entities.get(id)?.deref();
}

/**
 * Register an entity by its ID
 * @param entity
 */
export function registerEntity(entity: Readonly<IEntity>) {
    entities.set(entity.id, new WeakRef(entity));
}

/**
 * Remove an entity
 * @param entity
 */
export function unregisterEntity(entity: Readonly<IEntity>): void {
    unregisterEntityId(entity.id);
}

/**
 * Remove an entity by id
 * @param id
 */
export function unregisterEntityId(id: TEntityId): void {
    entities.delete(id);
}
