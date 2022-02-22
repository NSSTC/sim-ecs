import {TTypeProto} from "../_.spec";
import {ISystem} from "../system";

export interface ISystemError {
    readonly cause: Error
    readonly System: TTypeProto<ISystem>
}
