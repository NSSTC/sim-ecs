import {ISystemBuilder} from "./system-builder.spec";
import {ISystem, TSystemFunction, TSystemParameterDesc} from "./system.spec";

export * from "./system-builder.spec";

export class SystemBuilder<PARAMDESC extends TSystemParameterDesc> implements ISystemBuilder<PARAMDESC> {
    parameterDesc: PARAMDESC;
    setupFunction: TSystemFunction<PARAMDESC> = () => {};
    runFunction: TSystemFunction<PARAMDESC> = () => {};


    constructor(params: PARAMDESC) {
        this.parameterDesc = params;
    }

    build(): ISystem<PARAMDESC> {
        const self = this;
        return new class implements ISystem<PARAMDESC> {
            readonly parameterDesc = self.parameterDesc;
            readonly runFunction = self.runFunction;
            readonly setupFunction = self.setupFunction;
        }
    }

    withRunFunction(fn: TSystemFunction<PARAMDESC>): SystemBuilder<PARAMDESC> {
        this.runFunction = fn;
        return this;
    }

    withSetupFunction(fn: TSystemFunction<PARAMDESC>): SystemBuilder<PARAMDESC> {
        this.setupFunction = fn;
        return this;
    }
}
