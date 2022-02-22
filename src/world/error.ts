import {ISystemError} from "./error.spec";
import {TTypeProto} from "../_.spec";
import {ISystem} from "../system/system.spec";

export class SystemError implements ISystemError {
    constructor(
        protected _cause: Error,
        protected _System: TTypeProto<ISystem>
    ) {}

    get cause(): Error {
        return this._cause;
    }

    get System(): TTypeProto<ISystem> {
        return this._System;
    }
}
