import type {TTypeProto} from "../_.spec.ts";
import type {ISystem} from "../system/system.spec.ts";

export interface ISystemError {
    readonly cause: Readonly<Error>
    readonly System: Readonly<TTypeProto<ISystem>>
}
