import {IEntity} from "./entity";
import {TObjectProto} from "./_.spec";

/// stores the constructor name and the data blob on indices 0 and 1 accordingly
export type TComponent = [string, unknown];
export type TSerializer = (component: unknown) => string;
export type TDeserializer = (constructorName: string, data: unknown) => Object;
export type TCustomDeserializer = (data: unknown) => Object;
export type TEntity = TComponent[];
export type TSaveFormat = TEntity[];

export interface ISaveFormat {
    getEntities(deserializer?: TDeserializer): Iterable<IEntity>
    loadJSON(json: string): void
    registerComponent(Component: TObjectProto, deserializer: TCustomDeserializer, serializer: TSerializer): void
    setEntities(entities?: IterableIterator<IEntity>, serializer?: TSerializer): void
    toJSON(): string
}
