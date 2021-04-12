import {IEntity} from "./entity.spec";
import {TObjectProto} from "./_.spec";

/// stores the constructor name and the data blob on indices 0 and 1 accordingly
export type TComponent = [string, unknown];
export type TCustomDeserializer = (data: unknown) => Object;
export type TDeserializer = (constructorName: string, data: unknown) => Object;
export type TEntity = TComponent[];
export type TSaveFormat = TEntity[];
export type TSerializer = (component: unknown) => string;

export interface ISerDe {
    deserializer: TCustomDeserializer
    serializer: TSerializer
}

export interface ISaveFormat {
    readonly rawEntities: TSaveFormat

    deserialize(constructorName: string, rawComponent: unknown, fallbackDeserializer?: TDeserializer): Object
    getEntities(deserializer?: TDeserializer): Iterable<IEntity>
    loadJSON(json: string): void
    registerComponent(Component: TObjectProto, deserializer: TCustomDeserializer, serializer: TSerializer): void
    setEntities(entities?: IterableIterator<IEntity>, serializer?: TSerializer): void
    toJSON(): string
}

export const CTagMarker = '#';
