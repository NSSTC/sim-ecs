import {IEntity} from "../entity.spec";
import {TObjectProto} from "../_.spec";
import {ISerialFormat} from "./serial-format.spec";

/// stores the constructor name and the data blob on indices 0 and 1 accordingly
export type TCustomDeserializer = (data: unknown) => IDeserializerOutput;
export type TDeserializer = (constructorName: string, data: unknown) => IDeserializerOutput;
export type TSerDeOptions<T> = {
    fallbackHandler?: T,
    useDefaultHandler?: boolean,
    useRegisteredHandlers?: boolean,
};
export type TSerializable = unknown;
export type TSerializer = (component: unknown) => TSerializable;


export interface IDeserializerOutput {
    containsRefs: boolean
    data: Object
}

export interface ISerDeDataSet {
    entities: IterableIterator<IEntity>
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
    deserialize(data: ISerialFormat, options?: TSerDeOptions<TDeserializer>): ISerDeDataSet

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
    serialize(data: ISerDeDataSet, options?: TSerDeOptions<TSerializer>): ISerialFormat
}


export const CMarkerSeparator = '|';
export const CRefMarker = '*****';
export const CTagMarker = '#Tags';
