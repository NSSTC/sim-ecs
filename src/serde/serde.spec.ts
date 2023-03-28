import type {IEntity} from "../entity/entity.spec.ts";
import type {TObjectProto} from "../_.spec.ts";
import type {ISerialFormat} from "./serial-format.spec.ts";
import type {IEntitiesQuery} from "../query/query.spec.ts";

/// stores the constructor name and the data blob on indices 0 and 1 accordingly
export type TCustomDeserializer = (data: unknown) => IDeserializerOutput;
export type TDeserializer = (constructorName: string, data: unknown) => IDeserializerOutput;
export type TSerializable = unknown;
export type TSerializer = (component: unknown) => TSerializable;


export interface ISerDeOptions<T extends TSerializer | TDeserializer> {
    entities?: Readonly<IEntitiesQuery>
    fallbackHandler?: T
    /**
     * Replace resources in the world with loaded data
     * @default true
     */
    replaceResources?: boolean
    resources?: ReadonlyArray<TObjectProto>
    useDefaultHandler?: boolean
    useRegisteredHandlers?: boolean
}

export interface IDeserializerOutput {
    containsRefs: boolean
    data: object
    type: Readonly<TObjectProto>
}

export interface ISerDeDataSet {
    entities: IterableIterator<Readonly<IEntity>>
    resources: Readonly<Record<string, Readonly<object>>>
}

export interface ISerDeOperations {
    deserializer: TCustomDeserializer
    serializer: TSerializer
}

export interface ISerDe {
    /**
     * Transform writable data to usable data objects
     * @param data
     * @param options
     */
    deserialize(data: Readonly<ISerialFormat>, options?: Readonly<ISerDeOptions<TDeserializer>>): ISerDeDataSet

    /**
     * Get an overview over all registered type handlers; useful for debugging
     */
    getRegisteredTypeHandlers(): IterableIterator<[string, Readonly<ISerDeOperations>]>

    /**
     * Register type handlers for transformations
     * @param Type
     * @param deserializer
     * @param serializer
     */
    registerTypeHandler(Type: Readonly<TObjectProto>, deserializer: TCustomDeserializer, serializer: TSerializer): void

    /**
     * Transform data objects into writable data
     * @param data
     * @param options
     */
    serialize(data: Readonly<ISerDeDataSet>, options?: Readonly<ISerDeOptions<TSerializer>>): ISerialFormat

    /**
     * Remove a type handler registration
     * @param Type
     */
    unregisterTypeHandler(Type: Readonly<TObjectProto>): void
}


export const CIdMarker = '#ID' as const;
export const CMarkerSeparator = '|' as const;
export const CRefMarker = '*****' as const;
export const CResourceMarker = '#RES' as const;
export const CResourceMarkerValue = 1 as const;
export const CTagMarker = '#TAGS' as const;
