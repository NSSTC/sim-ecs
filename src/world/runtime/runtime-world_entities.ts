import {type RuntimeWorld} from "./runtime-world.ts";
import type {IEntity} from "../../entity/entity.spec.ts";
import {addEntitySym, removeEntitySym} from "../../query/_.ts";
import {SimECSEntityAddEvent, SimECSEntityRemoveEvent} from "../../events/internal-events.ts";

export function addEntity(this: RuntimeWorld, entity: Readonly<IEntity>): void {
    this.data.entities.add(entity);

    {
        let query;
        for (query of this.queries) {
            query[addEntitySym](entity);
        }
    }

    // todo: await in 0.7.0
    this.eventBus.publish(new SimECSEntityAddEvent(entity));
}

export function hasEntity(this: RuntimeWorld, entity: Readonly<IEntity>): boolean {
    return this.data.entities.has(entity);
}

export function removeEntity(this: RuntimeWorld, entity: Readonly<IEntity>): void {
    this.data.entities.delete(entity);

    {
        let query;
        for (query of this.queries) {
            query[removeEntitySym](entity);
        }
    }

    // todo: await in 0.7.0
    this.eventBus.publish(new SimECSEntityRemoveEvent(entity));
}