import {IEntity} from "./entity";

/// stores the constructor name and the data blob on indices 0 and 1 accordingly
export type TComponent = [string, any];
export type TDeserializer = (constructorName: string, data: any) => Object;
export type TEntity = TComponent[];
export type TSaveFormat = TEntity[];

export interface ISaveFormat {
    getEntities(deserializer: TDeserializer): Iterable<IEntity>
    toJSON(): string
}
