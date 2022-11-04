import type {TTypeProto} from "../_.spec";
import type {ISystem} from "../system/system.spec";

export interface ISystemError {
    readonly cause: Error
    readonly System: TTypeProto<ISystem>
}
