import {type PreptimeWorld} from "../preptime/preptime-world";
import type {IEntity} from "../../entity/entity.spec";
import type {IEntityBuilder} from "../../entity/entity-builder.spec";
import type {IEntitiesQuery} from "../../query/query.spec";
import {EntityBuilder} from "../../entity/entity-builder";
import {Entity} from "../../entity/entity";
import {type RuntimeWorld} from "../runtime/runtime-world";


export function addEntity(this: PreptimeWorld | RuntimeWorld, entity: IEntity): void {
    this.data.entities.add(entity);
}

export function buildEntity(this: PreptimeWorld | RuntimeWorld, uuid?: string): IEntityBuilder {
    return new EntityBuilder(uuid, entity => this.addEntity(entity));
}

export function clearEntities(this: PreptimeWorld | RuntimeWorld): void {
    let entity;
    for (entity of this.data.entities) {
        this.removeEntity(entity);
    }

    this.clearGroups();
}

export function createEntity(this: PreptimeWorld | RuntimeWorld): IEntity {
    const entity = new Entity();
    this.addEntity(entity);
    return entity;
}

export function getEntities(this: PreptimeWorld | RuntimeWorld, query?: IEntitiesQuery): IterableIterator<IEntity> {
    if (!query) {
        return this.data.entities.keys();
    }

    return Array.from(this.data.entities.keys())
        .filter(entity => query.matchesEntity(entity))
        .values();
}

export function hasEntity(this: PreptimeWorld | RuntimeWorld, entity: IEntity): boolean {
    return this.data.entities.has(entity);
}

export function removeEntity(this: PreptimeWorld | RuntimeWorld, entity: IEntity): void {
    this.data.entities.delete(entity);
}
