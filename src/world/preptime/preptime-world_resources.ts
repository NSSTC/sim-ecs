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
