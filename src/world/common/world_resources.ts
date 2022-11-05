import type {TTypeProto} from "../../_.spec";
import {type PreptimeWorld} from "../preptime/preptime-world";
import {type RuntimeWorld} from "../runtime/runtime-world";

export function addResource<T extends Object>(this: PreptimeWorld | RuntimeWorld, obj: T | TTypeProto<T>, ...args: Array<unknown>): T {
    let type: TTypeProto<T>;
    let instance: T;

    if (typeof obj === 'object') {
        type = obj.constructor as TTypeProto<T>;
        instance = obj;
    } else {
        type = obj;
        instance = new (obj.prototype.constructor.bind(obj, ...Array.from(arguments).slice(1)))();
    }

    if (this.data.resources.has(type)) {
        throw new Error(`Resource with name "${type.name}" already exists!`);
    }

    this.data.resources.set(type, instance);
    return instance;
}

export function clearResources(this: PreptimeWorld | RuntimeWorld): void {
    this.data.resources.clear();
}

export function getResource<T extends Object>(this: PreptimeWorld | RuntimeWorld, type: TTypeProto<T>): T {
    if (!this.data.resources.has(type)) {
        throw new Error(`Resource of type "${type.name}" does not exist!`);
    }

    return this.data.resources.get(type) as T;
}

export function *getResources<T extends Object>(this: PreptimeWorld | RuntimeWorld, types?: Array<TTypeProto<T>> | IterableIterator<TTypeProto<T>>): IterableIterator<T> {
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
            if (typesArray.includes(type as TTypeProto<T>)) {
                yield resource as T;
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

export function replaceResource<T extends Object>(this: PreptimeWorld | RuntimeWorld, obj: T | TTypeProto<T>, ...args: Array<unknown>): void {
    let type: TTypeProto<T>;

    if (typeof obj === 'object') {
        type = obj.constructor as TTypeProto<T>;
    } else {
        type = obj;
    }

    if (!this.data.resources.has(type)) {
        throw new Error(`Resource with name "${type.name}" does not exists!`);
    }

    this.data.resources.delete(type);
    this.addResource(obj, ...args);
}
