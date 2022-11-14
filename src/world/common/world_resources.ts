import type {TObjectProto, TTypeProto} from "../../_.spec";
import {type PreptimeWorld} from "../preptime/preptime-world";
import {type RuntimeWorld} from "../runtime/runtime-world";
import type {TExistenceQuery} from "../../query/query.spec";


export function clearResources(this: PreptimeWorld | RuntimeWorld): void {
    this.data.resources.clear();
}

export function getResource<T extends Object>(this: RuntimeWorld, type: TTypeProto<T>): T {
    if (!this.data.resources.has(type)) {
        throw new Error(`Resource of type "${type.name}" does not exist!`);
    }

    return this.data.resources.get(type) as T;
}

export function *getResources(this: PreptimeWorld | RuntimeWorld, types?: TExistenceQuery<any>): IterableIterator<object> {
    if (!types) {
        return this.data.resources.values();
    }

    const typesArray = Array.isArray(types)
        ? types
        : Array.from(types);

    {
        let resource;
        let type;

        for ([type, resource] of this.data.resources.entries()) {
            if (typesArray.includes(type as TObjectProto)) {
                yield resource;
            }
        }
    }
}

export function hasResource<T extends Object>(this: PreptimeWorld | RuntimeWorld, obj: T | TTypeProto<T>): boolean {
    let type: TTypeProto<T>;

    if (typeof obj === 'object') {
        type = obj.constructor as TTypeProto<T>;
    } else {
        type = obj;
    }

    return this.data.resources.has(type);
}

export function removeResource<T extends Object>(this: PreptimeWorld | RuntimeWorld, type: TTypeProto<T>): void {
    if (!this.data.resources.has(type)) {
        throw new Error(`Resource with name "${type.name}" does not exists!`);
    }

    this.data.resources.delete(type);
}
