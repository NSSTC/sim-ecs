import type {TGroupHandle} from "../world.spec";
import type {IEntity} from "../../entity/entity.spec";
import type {IPreptimeWorld} from "../preptime/preptime-world.spec";
import {type PreptimeWorld} from "../preptime/preptime-world";
import {type RuntimeWorld} from "../runtime/runtime-world";
import type {IMutableWorld} from "../world.spec";


export function addEntityToGroup(this: PreptimeWorld | RuntimeWorld, groupHandle: TGroupHandle, entity: IEntity): void {
    this.addEntitiesToGroup(groupHandle, [entity]);
}

export function addEntitiesToGroup(this: PreptimeWorld | RuntimeWorld, groupHandle: TGroupHandle, entities: Array<IEntity> | IterableIterator<IEntity>): void {
    const link = getLink(this, groupHandle);
    let entity;
    for (entity of entities) {
        link.add(entity);
    }
}

export function assimilateGroup(this: PreptimeWorld | RuntimeWorld, otherWorld: IPreptimeWorld, handle: TGroupHandle): TGroupHandle {
    const entities = otherWorld.getGroupEntities(handle);
    const newGroup = this.createGroup();

    otherWorld.removeGroup(handle);
    this.addEntitiesToGroup(newGroup, entities);

    return newGroup;
}

export function clearGroups(this: PreptimeWorld | RuntimeWorld): void {
    this.data.groups.entityLinks.clear();
    this.data.groups.nextHandle = 0;
}

export function createGroup(this: PreptimeWorld | RuntimeWorld): TGroupHandle {
    const handle = this.data.groups.nextHandle++;
    this.data.groups.entityLinks.set(handle, new Set());
    return handle;
}

export function getGroupEntities(this: PreptimeWorld | RuntimeWorld, groupHandle: TGroupHandle): IterableIterator<IEntity> {
    return getLink(this, groupHandle).keys();
}

function getLink(world: PreptimeWorld | RuntimeWorld, groupHandle: TGroupHandle): Set<IEntity> {
    const link = world.data.groups.entityLinks.get(groupHandle);

    if (!link) {
        throw new Error(`The group "${groupHandle}" does not exist in the world "${world.name}"`);
    }

    return link;
}

export function removeGroup(this: IMutableWorld & (PreptimeWorld | RuntimeWorld), groupHandle: TGroupHandle): void {
    const link = getLink(this, groupHandle);

    let entity;
    for (entity of link) {
        this.removeEntity(entity);
    }

    this.data.groups.entityLinks.delete(groupHandle);
}
