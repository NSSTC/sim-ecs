import type {ISystemError} from "./error.spec";
import type {TTypeProto} from "../_.spec";
import type {ISystem} from "../system/system.spec";

export class SystemError implements ISystemError {
    constructor(
        protected _cause: Readonly<Error>,
        protected _System: Readonly<TTypeProto<ISystem>>
    ) {}

    get cause(): Error {
        return this._cause;
    }

    get System(): Readonly<TTypeProto<ISystem>> {
        return this._System;
    }
}
