import type {TGroupHandle} from "../world.spec.ts";
import type {IEntity} from "../../entity/entity.spec.ts";
import type {IPreptimeWorld} from "../preptime/preptime-world.spec.ts";
import {type PreptimeWorld} from "../preptime/preptime-world.ts";
import {type RuntimeWorld} from "../runtime/runtime-world.ts";
import type {IMutableWorld} from "../world.spec.ts";

export function merge(
    this: IMutableWorld & (PreptimeWorld | RuntimeWorld),
    elsewhere: Readonly<IPreptimeWorld>,
    intoGroup?: TGroupHandle,
): [TGroupHandle, Array<IEntity>] {
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
