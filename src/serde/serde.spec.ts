import type {IEntity} from "../entity/entity.spec";
import type {TObjectProto} from "../_.spec";
import type {ISerialFormat} from "./serial-format.spec";
import type {IEntitiesQuery} from "../query/query.spec";

/// stores the constructor name and the data blob on indices 0 and 1 accordingly
export type TCustomDeserializer = (data: unknown) => IDeserializerOutput;
export type TDeserializer = (constructorName: string, data: unknown) => IDeserializerOutput;
export type TSerializable = unknown;
export type TSerializer = (component: unknown) => TSerializable;


export interface ISerDeOptions<T extends TSerializer | TDeserializer> {
    // this is true by default!
    autoAssignId?: boolean
    entities?: IEntitiesQuery
    fallbackHandler?: T
    /**
     * Replace resources in the world with loaded data
     * @default true
     */
    replaceResources?: boolean
    resources?: TObjectProto[]
    useDefaultHandler?: boolean
    useRegisteredHandlers?: boolean
}

export interface IDeserializerOutput {
    containsRefs: boolean
    data: Object
    type: TObjectProto
}

export interface ISerDeDataSet {
    entities: IterableIterator<IEntity>
    resources: Record<string, Object>
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
    deserialize(data: ISerialFormat, options?: ISerDeOptions<TDeserializer>): ISerDeDataSet

    /**
     * Get an overview over all registered type handlers; useful for debugging
     */
    getRegisteredTypeHandlers(): IterableIterator<[string, ISerDeOperations]>

    /**
     * Register type handlers for transformations
     * @param Type
     * @param deserializer
     * @param serializer
     */
    registerTypeHandler(Type: TObjectProto, deserializer: TCustomDeserializer, serializer: TSerializer): void

    /**
     * Transform data objects into writable data
     * @param data
     * @param options
     */
    serialize(data: ISerDeDataSet, options?: ISerDeOptions<TSerializer>): ISerialFormat

    /**
     * Remove a type handler registration
     * @param Type
     */
    unregisterTypeHandler(Type: TObjectProto): void
}


export const CIdMarker = '#ID';
export const CMarkerSeparator = '|';
export const CRefMarker = '*****';
export const CResourceMarker = '#RES';
export const CResourceMarkerValue = 1;
export const CTagMarker = '#TAGS';
