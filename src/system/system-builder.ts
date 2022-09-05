import type {ISystemBuilder} from "./system-builder.spec";
import type {ISystem, TSystemFunction, TSystemParameterDesc} from "./system.spec";

export class SystemBuilder<PARAMDESC extends TSystemParameterDesc> implements ISystemBuilder<PARAMDESC> {
    systemName: string = '';
    parameterDesc: PARAMDESC;
    setupFunction: TSystemFunction<PARAMDESC> = () => {};
    runFunction: TSystemFunction<PARAMDESC> = () => {};


    constructor(params: PARAMDESC) {
        this.parameterDesc = params;
    }

    build(): ISystem<PARAMDESC> {
        const self = this;
        const System = class implements ISystem<PARAMDESC> {
            readonly name = self.systemName;
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

    name(name: string): SystemBuilder<PARAMDESC> {
        return this.withName(name);
    }

    run(fn: TSystemFunction<PARAMDESC>): SystemBuilder<PARAMDESC> {
        return this.withRunFunction(fn);
    }

    setup(fn: TSystemFunction<PARAMDESC>): SystemBuilder<PARAMDESC> {
        return this.withSetupFunction(fn);
    }

    withName(name: string): SystemBuilder<PARAMDESC> {
        this.systemName = name;
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

// Change alias refs for better performance

SystemBuilder.prototype.name = SystemBuilder.prototype.withName;
SystemBuilder.prototype.run = SystemBuilder.prototype.withRunFunction;
SystemBuilder.prototype.setup = SystemBuilder.prototype.withSetupFunction;
