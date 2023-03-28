import {type PreptimeWorld} from "../preptime/preptime-world.ts";
import type {IEntity} from "../../entity/entity.spec.ts";
import type {IEntityBuilder} from "../../entity/entity-builder.spec.ts";
import type {IEntitiesQuery} from "../../query/query.spec.ts";
import {EntityBuilder} from "../../entity/entity-builder.ts";
import {Entity} from "../../entity/entity.ts";
import {type RuntimeWorld} from "../runtime/runtime-world.ts";
import type {IMutableWorld} from "../world.spec.ts";


export function buildEntity(this: IMutableWorld, uuid?: string): IEntityBuilder {
    const self = this;
    return new EntityBuilder(uuid, entity => self.addEntity(entity));
}

export function clearEntities(this: IMutableWorld & (PreptimeWorld | RuntimeWorld)): void {
    let entity;
    for (entity of this.data.entities) {
        this.removeEntity(entity);
    }

    this.clearGroups();
}

export function createEntity(this: IMutableWorld): IEntity {
    const entity = new Entity();
    this.addEntity(entity);
    return entity;
}

export function getEntities(this: PreptimeWorld | RuntimeWorld, query?: Readonly<IEntitiesQuery>): IterableIterator<IEntity> {
    if (!query) {
        return this.data.entities.values();
    }

    return Array.from(this.data.entities.values())
        .filter(entity => query.matchesEntity(entity))
        .values();
}
