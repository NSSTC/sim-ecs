import type {TObjectProto} from "../_.spec.ts";

export class InstanceMap<T extends TObjectProto> extends Map<T, Readonly<InstanceType<T>>> {}
export interface ReadonlyInstanceMap<T extends TObjectProto> extends ReadonlyMap<T, InstanceType<T>> {}
