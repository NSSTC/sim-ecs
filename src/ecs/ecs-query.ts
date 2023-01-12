import type {IAccessQuery, IComponentsQuery, IEntitiesQuery, TExistenceQuery} from "../query/query.spec";
import {EntitiesQuery} from "../query/entities-query";
import {ComponentsQuery} from "../query/components-query";
import type {TObjectProto} from "../_.spec";
import {TTypeProto} from "../_.spec";


export const CComponentFieldType = {
    any: Array,
    f32: Float32Array,
    f64: Float64Array,
    i8: Int8Array,
    i16: Int16Array,
    i32: Int32Array,
    i64: BigInt64Array,
    u8: Uint8ClampedArray,
    u16: Uint16Array,
    u32: Uint32Array,
    u64: BigUint64Array,
}

export type TComponentFieldTypesMap<T extends object = object> = Map<TTypeProto<T>, { [fieldName in keyof T]: keyof typeof CComponentFieldType}>;

const componentFieldTypes: TComponentFieldTypesMap = new Map();

export function getComponentFieldTypes<T extends object>(): ReadonlyMap<TTypeProto<T>, { [fieldName in keyof T]: keyof typeof CComponentFieldType }> {
    // @ts-ignore todo
    return componentFieldTypes;
}

export function queryComponents<DESC extends IAccessQuery<TObjectProto>>(query: Readonly<DESC>, initialArchetypeCacheSize = 1000): IComponentsQuery<DESC> {
    return new ComponentsQuery(query, initialArchetypeCacheSize);
}

export function queryEntities(...query: Readonly<TExistenceQuery<TObjectProto>>): IEntitiesQuery {
    return new EntitiesQuery(query);
}

export function registerComponentFieldTypes<T extends object>(ComponentType: TTypeProto<T>, propertyTypings: { [fieldName in keyof T]: keyof typeof CComponentFieldType }): void {
    if (componentFieldTypes.has(ComponentType)) {
        throw new Error(`The field types for ${ComponentType.name} have already been registered!`);
    }

    componentFieldTypes.set(ComponentType, propertyTypings);
}
