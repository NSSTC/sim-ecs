import type {ISystemBuilder} from "./system-builder.spec.ts";
import type {ISystem, TSystemFunction, TSystemParameterDesc} from "./system.spec.ts";
import {setRuntimeContext, unsetRuntimeContext} from "./system_context.ts";
import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec.ts";
import type {ISystemContext} from "./system_context.spec.ts";

export * from "./system-builder.spec.ts";

export class SystemBuilder<PARAMDESC extends TSystemParameterDesc> implements ISystemBuilder<Readonly<PARAMDESC>> {
    systemName: string = 'ECS_Unnamed_System';
    parameterDesc: Readonly<PARAMDESC>;
    setupFunction: TSystemFunction<Readonly<PARAMDESC>> = () => {};
    runFunction: TSystemFunction<Readonly<PARAMDESC>> = () => {};


    constructor(params: Readonly<PARAMDESC>) {
        this.parameterDesc = params;
    }

    build(): Readonly<ISystem<Readonly<PARAMDESC>>> {
        const self = this;
        const System = class implements Readonly<ISystem<Readonly<PARAMDESC>>>, ISystemContext {
            /** @internal */
            _context = undefined;
            /** @internal */
            _handlers = new Map();

            readonly name = self.systemName;
            readonly parameterDesc = self.parameterDesc;
            readonly runFunction = self.runFunction;
            readonly setupFunction = self.setupFunction;

            get runtimeContext(): IRuntimeWorld | undefined {
                return this._context;
            }

            /** @internal */
            setRuntimeContext = setRuntimeContext;
            /** @internal */
            unsetRuntimeContext = unsetRuntimeContext;
        };

        Object.defineProperty(System, 'name', {
            configurable: false,
            writable: false,
            enumerable: false,
            value: this.systemName,
        });

        return new System();
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

    name = this.withName;
    run = this.withRunFunction;
    setup = this.withSetupFunction;
}
