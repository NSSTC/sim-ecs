import {type RuntimeWorld} from "./runtime-world";
import type {IEntity} from "../../entity/entity.spec";
import {addEntitySym, removeEntitySym} from "../../query/_";

export function addEntity(this: RuntimeWorld, entity: IEntity): void {
    this.data.entities.add(entity);

    {
        let query;
        for (query of this.queries) {
            query[addEntitySym](entity);
        }
    }
}

export function hasEntity(this: RuntimeWorld, entity: IEntity): boolean {
    return this.data.entities.has(entity);
}

export function removeEntity(this: RuntimeWorld, entity: IEntity): void {
    this.data.entities.delete(entity);

    {
        let query;
        for (query of this.queries) {
            query[removeEntitySym](entity);
        }
    }
}