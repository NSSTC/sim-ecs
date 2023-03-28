import type {ISystemBuilder} from "./system-builder.spec.ts";
import type {ISystem, TSystemFunction, TSystemParameterDesc} from "./system.spec.ts";

export * from "./system-builder.spec.ts";

export class SystemBuilder<PARAMDESC extends TSystemParameterDesc> implements ISystemBuilder<Readonly<PARAMDESC>> {
    systemName: string = '';
    parameterDesc: Readonly<PARAMDESC>;
    setupFunction: TSystemFunction<Readonly<PARAMDESC>> = () => {};
    runFunction: TSystemFunction<Readonly<PARAMDESC>> = () => {};


    constructor(params: Readonly<PARAMDESC>) {
        this.parameterDesc = params;
    }

    build(): ISystem<Readonly<PARAMDESC>> {
        const self = this;
        const System = class implements Readonly<ISystem<Readonly<PARAMDESC>>> {
            readonly name = self.systemName;
            readonly parameterDesc = self.parameterDesc;
            readonly runFunction = self.runFunction;
            readonly setupFunction = self.setupFunction;
        };

        Object.defineProperty(System, 'name', {
            configurable: true,
            writable: false,
            enumerable: false,
            value: this.systemName,
        });

        return new System();
    }

    name(name: string): SystemBuilder<Readonly<PARAMDESC>> {
        return this.withName(name);
    }

    run(fn: TSystemFunction<Readonly<PARAMDESC>>): SystemBuilder<Readonly<PARAMDESC>> {
        return this.withRunFunction(fn);
    }

    setup(fn: TSystemFunction<Readonly<PARAMDESC>>): SystemBuilder<Readonly<PARAMDESC>> {
        return this.withSetupFunction(fn);
    }

    withName(name: string): SystemBuilder<Readonly<PARAMDESC>> {
        this.systemName = name;
        return this;
    }

    withRunFunction(fn: TSystemFunction<Readonly<PARAMDESC>>): SystemBuilder<Readonly<PARAMDESC>> {
        this.runFunction = fn;
        return this;
    }

    withSetupFunction(fn: TSystemFunction<Readonly<PARAMDESC>>): SystemBuilder<Readonly<PARAMDESC>> {
        this.setupFunction = fn;
        return this;
    }
}

// Change alias refs for better performance

SystemBuilder.prototype.name = SystemBuilder.prototype.withName;
SystemBuilder.prototype.run = SystemBuilder.prototype.withRunFunction;
SystemBuilder.prototype.setup = SystemBuilder.prototype.withSetupFunction;
