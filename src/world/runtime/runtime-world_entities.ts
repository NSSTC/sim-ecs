import {type RuntimeWorld} from "./runtime-world.ts";
import type {IEntity, IEventMap} from "../../entity/entity.spec.ts";
import {addEntitySym, removeEntitySym} from "../../query/_.ts";
import {
    SimECSAddEntityEvent,
    SimECSCloneEntityEvent,
    SimECSEntityAddComponentEvent,
    SimECSEntityAddTagEvent,
    SimECSEntityRemoveComponentEvent,
    SimECSEntityRemoveTagEvent,
    SimECSRemoveEntityEvent,
} from "../../events/internal-events.ts";


export function addEntity(this: RuntimeWorld, entity: Readonly<IEntity>): void {
    this.data.entities.add(entity);

    { // wire up entity events
        const eventMap: IEventMap = {
            addComponent: event => this.eventBus.publish(
                new SimECSEntityAddComponentEvent(entity, event.componentType, event.componentInstance)
            ),
            addTag: event => this.eventBus.publish(
                new SimECSEntityAddTagEvent(entity, event.tag)
            ),
            clone: event => this.eventBus.publish(
                new SimECSCloneEntityEvent(entity, event.clone)
            ),
            removeComponent: event => this.eventBus.publish(
                new SimECSEntityRemoveComponentEvent(entity, event.componentType, event.componentInstance)
            ),
            removeTag: event => this.eventBus.publish(
                new SimECSEntityRemoveTagEvent(entity, event.tag)
            ),
        };

        entity.addEventListener("addComponent", eventMap.addComponent);
        entity.addEventListener("addTag", eventMap.addTag);
        entity.addEventListener("clone", eventMap.clone);
        entity.addEventListener("removeComponent", eventMap.removeComponent);
        entity.addEventListener("removeTag", eventMap.removeTag);

        this.entityEventHandlers.set(entity, eventMap);
    }

    { // add entity to queries
        let query;
        for (query of this.queries) {
            query[addEntitySym](entity);
        }
    }

    // todo: await in 0.7.0
    this.eventBus.publish(new SimECSAddEntityEvent(entity));
}

export function hasEntity(this: RuntimeWorld, entity: Readonly<IEntity>): boolean {
    return this.data.entities.has(entity);
}

export function refreshEntityQueryRegistration(this: RuntimeWorld, entity: Readonly<IEntity>): void {
    let query;
    for (query of this.queries) {
        query[removeEntitySym](entity);
        query[addEntitySym](entity);
    }
}

export function removeEntity(this: RuntimeWorld, entity: Readonly<IEntity>): void {
    if (!this.data.entities.has(entity)) {
        return;
    }

    this.data.entities.delete(entity);

    { // Remove entity from all queries
        let query;
        for (query of this.queries) {
            query[removeEntitySym](entity);
        }
    }

    { // unregister entity events
        const eventMap = this.entityEventHandlers.get(entity)!;

        entity.removeEventListener("addComponent", eventMap.addComponent);
        entity.removeEventListener("addTag", eventMap.addTag);
        entity.removeEventListener("clone", eventMap.clone);
        entity.removeEventListener("removeComponent", eventMap.removeComponent);
        entity.removeEventListener("removeTag", eventMap.removeTag);

        this.entityEventHandlers.delete(entity);
    }

    // todo: await in 0.7.0
    this.eventBus.publish(new SimECSRemoveEntityEvent(entity));
}