import type {TTypeProto} from "../_.spec";
import type {ISystem} from "../system/system.spec";

export interface ISystemError {
    readonly cause: Readonly<Error>
    readonly System: Readonly<TTypeProto<ISystem>>
}
