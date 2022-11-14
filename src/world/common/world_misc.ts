import type {TGroupHandle} from "../world.spec";
import type {IEntity} from "../../entity/entity.spec";
import type {IPreptimeWorld} from "../preptime/preptime-world.spec";
import {type PreptimeWorld} from "../preptime/preptime-world";
import {type RuntimeWorld} from "../runtime/runtime-world";
import type {IMutableWorld} from "../world.spec";

export function merge(this: IMutableWorld & (PreptimeWorld | RuntimeWorld), elsewhere: IPreptimeWorld, intoGroup?: TGroupHandle): [TGroupHandle, Array<IEntity>] {
    const groupHandle = intoGroup ?? this.data.groups.nextHandle++;
    const entities = [];
    let entity;

    for (entity of elsewhere.getEntities()) {
        elsewhere.removeEntity(entity);
        this.addEntity(entity);
        entities.push(entity);
    }

    return [groupHandle, entities];
}
