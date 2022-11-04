import type {IAccessQuery, IComponentsQuery, IEntitiesQuery} from "../query/query.spec";
import type {TObjectProto, TTypeProto} from "../_.spec";
import type {ISystemActions} from "../world.spec";
import {systemEventReaderSym, systemEventWriterSym, systemResourceTypeSym, systemRunParamSym} from "./_";
import type {IEventReader} from "../events/event-reader.spec";
import type {IEventWriter} from "../events/event-writer.spec";

export type TSystemParameter =
    IEntitiesQuery
    | IEventReader<TObjectProto>
    | IComponentsQuery<IAccessQuery<TObjectProto>>
    | ISystemActions
    | ISystemResource<TObjectProto>
    | ISystemStorage;
export type TSystemParameterDesc = { [name: string]: TSystemParameter };
export type TSystemFunction<PDESC extends TSystemParameterDesc> = (params: PDESC) => void | Promise<void>;

export interface ISystem<PDESC extends TSystemParameterDesc = TSystemParameterDesc> {
    [systemRunParamSym]?: PDESC
    readonly name: string
    readonly parameterDesc: PDESC
    readonly runFunction: TSystemFunction<PDESC>
    readonly setupFunction: TSystemFunction<PDESC>
}

export interface ISystemResource<T extends Object> {
    [systemResourceTypeSym]: TTypeProto<T>
}

interface ISystemStorage {}

export const Actions: ISystemActions = { [Symbol()]: undefined } as unknown as ISystemActions;

export function ReadEvents<T extends TObjectProto>(type: T): IEventReader<T> {
    return {
        [systemEventReaderSym]: type,
    } as unknown as IEventReader<T>;
}

export function ReadResource<T extends Object>(type: TTypeProto<T>): ISystemResource<T> & Readonly<T> {
    return {
        [systemResourceTypeSym]: type,
    } as ISystemResource<T> & Readonly<T>;
}

export function Storage<T>(initializer: T): ISystemStorage & T {
    return initializer as ISystemStorage & T;
}

export function WriteEvents<T extends TObjectProto>(type: T): IEventWriter<T> {
    return {
        [systemEventWriterSym]: type,
    } as unknown as IEventWriter<T>;
}

export function WriteResource<T extends Object>(type: TTypeProto<T>): ISystemResource<T> & T {
    return {
        [systemResourceTypeSym]: type,
    } as ISystemResource<T> & T;
}
