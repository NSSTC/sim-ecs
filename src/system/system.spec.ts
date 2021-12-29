import {IAccessQuery, IQuery, TExistenceQuery} from "../query/query.spec";
import {TObjectProto} from "../_.spec";
import {ISystemActions} from "../world.spec";
import {IIStateProto} from "../state.spec";

export type TSystemParameter = IQuery<IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>> | ISystemActions;
export type TSystemParameters = Array<TSystemParameter>;
export type TSystemRunFunction<PARAMS extends TSystemParameters = TSystemParameters> = (...params: PARAMS) => void | Promise<void>;
export type TSystemSetupFunction = (actions: ISystemActions) => void | Promise<void>;

export interface ISystem<PDESC extends TSystemParameters = TSystemParameters> {
    readonly parameters: PDESC
    readonly runFunction: TSystemRunFunction<PDESC>
    readonly setupFunction: TSystemSetupFunction
    readonly states: IIStateProto | IIStateProto[]
}
