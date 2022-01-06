import {IAccessQuery, IQuery, TExistenceQuery} from "../query/query.spec";
import {TObjectProto, TTypeProto} from "../_.spec";
import {ISystemActions} from "../world.spec";
import {systemResourceTypeSym, systemRunParamSym} from "./_";

export type TSystemParameter = IQuery<IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>> | ISystemActions | ISystemResource<TObjectProto> | ISystemStorage;
export type TSystemParameters = Array<TSystemParameter>;
export type TSystemFunction<PARAMS extends TSystemParameters = TSystemParameters> = (...params: PARAMS) => void | Promise<void>;

export interface ISystem<PDESC extends TSystemParameters = TSystemParameters> {
    [systemRunParamSym]?: PDESC
    readonly parameters: PDESC
    readonly runFunction: TSystemFunction<PDESC>
    readonly setupFunction: TSystemFunction<PDESC>
}

export interface ISystemResource<T extends Object> {
    [systemResourceTypeSym]: TTypeProto<T>
}

interface ISystemStorage {}

export const Actions: ISystemActions = { __phantom: undefined } as unknown as ISystemActions;

export function ReadResource<T extends Object>(type: TTypeProto<T>): ISystemResource<T> & Readonly<T> {
    return {
        [systemResourceTypeSym]: type,
    } as ISystemResource<T> & Readonly<T>;
}

export function Storage<T>(initializer: T): ISystemStorage & T {
    return initializer as ISystemStorage & T;
}

export function WriteResource<T extends Object>(type: TTypeProto<T>): ISystemResource<T> & T {
    return {
        [systemResourceTypeSym]: type,
    } as ISystemResource<T> & T;
}
