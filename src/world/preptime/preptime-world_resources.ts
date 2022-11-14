import type {TTypeProto} from "../../_.spec";
import {type PreptimeWorld} from "./preptime-world";

export function addResource<T extends Object>(this: PreptimeWorld, Type: T | TTypeProto<T>, ...args: Array<unknown>): T | TTypeProto<T> {
    this.data.resources.set(Type, args);
    return Type;
}
