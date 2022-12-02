import type {TTypeProto} from "../../_.spec";
import {type PreptimeWorld} from "./preptime-world";

export function addResource<T extends object>(
    this: PreptimeWorld,
    Type: T | TTypeProto<T>,
    ...args: ReadonlyArray<unknown>
): T | TTypeProto<T> {
    this.data.resources.set(Type, args);
    return Type;
}
