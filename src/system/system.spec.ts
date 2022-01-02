import {IAccessQuery, IQuery, TExistenceQuery} from "../query/query.spec";
import {TObjectProto} from "../_.spec";
import {ISystemActions} from "../world.spec";
import {IIStateProto} from "../state.spec";
import {systemRunParamSym} from "./_";

export type TSystemParameter = IQuery<IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>> | ISystemActions | ISystemStorage;
export type TSystemParameters = Array<TSystemParameter>;
export type TSystemFunction<PARAMS extends TSystemParameters = TSystemParameters> = (...params: PARAMS) => void | Promise<void>;

export interface ISystem<PDESC extends TSystemParameters = TSystemParameters> {
    [systemRunParamSym]?: PDESC
    readonly parameters: PDESC
    readonly runFunction: TSystemFunction<PDESC>
    readonly setupFunction: TSystemFunction<PDESC>
    readonly states: IIStateProto | IIStateProto[]
}

interface ISystemStorage {}

export const Actions: ISystemActions = { __phantom: undefined } as unknown as ISystemActions;
export function Storage<T extends Object>(): T {
    return {} as ISystemStorage & T;
}
