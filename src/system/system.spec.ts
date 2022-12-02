import type {IAccessQuery, IComponentsQuery, IEntitiesQuery} from "../query/query.spec";
import type {TObjectProto, TTypeProto} from "../_.spec";
import type {ISystemActions} from "../world/actions.spec";
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
export type TSystemFunction<PDESC extends TSystemParameterDesc> = (params: Readonly<PDESC>) => void | Promise<void>;

export interface ISystem<PDESC extends TSystemParameterDesc = TSystemParameterDesc> {
    /** @internal */
    [systemRunParamSym]?: Readonly<PDESC>
    readonly name: string
    readonly parameterDesc: Readonly<PDESC>
    readonly runFunction: TSystemFunction<Readonly<PDESC>>
    readonly setupFunction: TSystemFunction<Readonly<PDESC>>
}

export interface ISystemResource<T extends object> {
    /** @internal */
    [systemResourceTypeSym]: TTypeProto<T>
}

interface ISystemStorage {}

export const Actions: ISystemActions = { [Symbol()]: undefined } as unknown as Readonly<ISystemActions>;

export function ReadEvents<T extends TObjectProto>(type: T | ErrorConstructor): Readonly<IEventReader<T>> {
    return {
        [systemEventReaderSym]: type,
    } as unknown as IEventReader<T>;
}

export function ReadResource<T extends object>(type: TTypeProto<T>): ISystemResource<T> & T {
    return {
        [systemResourceTypeSym]: type,
    } as ISystemResource<T> & Readonly<T>;
}

export function Storage<T>(initializer: T): ISystemStorage & T {
    return initializer as ISystemStorage & T;
}

export function WriteEvents<T extends TObjectProto>(type: T): Readonly<IEventWriter<T>> {
    return {
        [systemEventWriterSym]: type,
    } as unknown as IEventWriter<T>;
}

export function WriteResource<T extends object>(type: TTypeProto<T>): ISystemResource<T> & T {
    return {
        [systemResourceTypeSym]: type,
    } as ISystemResource<T> & T;
}
