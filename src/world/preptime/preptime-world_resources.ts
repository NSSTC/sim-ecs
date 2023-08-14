import type {TTypeProto} from "../../_.spec.ts";
import {type PreptimeWorld} from "./preptime-world.ts";

export function addResource<T extends object>(
    this: PreptimeWorld,
    Type: T | TTypeProto<T>,
    ...args: ReadonlyArray<unknown>
): T | TTypeProto<T> {
    this.data.resources.set(Type, args);
    return Type;
}

export function removeResource<T extends object>(this: PreptimeWorld, type: TTypeProto<T>): void {
    if (!this.data.resources.has(type)) {
        throw new Error(`Resource with name "${type.name}" does not exists!`);
    }

    this.data.resources.delete(type);
}
