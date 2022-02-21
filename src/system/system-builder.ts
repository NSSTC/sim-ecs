import type {ISystemBuilder} from "./system-builder.spec";
import type {ISystem, TSystemFunction, TSystemParameterDesc} from "./system.spec";

export class SystemBuilder<PARAMDESC extends TSystemParameterDesc> implements ISystemBuilder<PARAMDESC> {
    name: string = '';
    parameterDesc: PARAMDESC;
    setupFunction: TSystemFunction<PARAMDESC> = () => {};
    runFunction: TSystemFunction<PARAMDESC> = () => {};


    constructor(params: PARAMDESC) {
        this.parameterDesc = params;
    }

    build(): ISystem<PARAMDESC> {
        const self = this;
        const System = class implements ISystem<PARAMDESC> {
            readonly name = self.name;
            readonly parameterDesc = self.parameterDesc;
            readonly runFunction = self.runFunction;
            readonly setupFunction = self.setupFunction;
        };

        Object.defineProperty(System, 'name', {
            configurable: true,
            writable: false,
            enumerable: false,
            value: this.name,
        });

        return new System();
    }

    withName(name: string): ISystemBuilder<PARAMDESC> {
        this.name = name;
        return this;
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
