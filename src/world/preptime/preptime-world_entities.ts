import {type PreptimeWorld} from "./preptime-world.ts";
import type {IEntity} from "../../entity/entity.spec.ts";

export function addEntity(this: PreptimeWorld, entity: Readonly<IEntity>): void {
    this.data.entities.add(entity);
}

export function hasEntity(this: PreptimeWorld, entity: Readonly<IEntity>): boolean {
    return this.data.entities.has(entity);
}

export function removeEntity(this: PreptimeWorld, entity: Readonly<IEntity>): void {
    this.data.entities.delete(entity);
}