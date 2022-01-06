import {ISystemBuilder} from "./system-builder.spec";
import {ISystem, TSystemParameters, TSystemFunction} from "./system.spec";

export * from "./system-builder.spec";

export class SystemBuilder<PARAMS extends TSystemParameters = TSystemParameters> implements ISystemBuilder<PARAMS> {
    parameters: PARAMS;
    setupFunction: TSystemFunction<PARAMS> = () => {};
    runFunction: TSystemFunction<PARAMS> = () => {};


    constructor(params: PARAMS) {
        this.parameters = params;
    }

    build(): ISystem<PARAMS> {
        const self = this;
        return new class implements ISystem<PARAMS> {
            readonly parameters = self.parameters;
            readonly runFunction = self.runFunction;
            readonly setupFunction = self.setupFunction;
        }
    }

    withRunFunction(fn: TSystemFunction<PARAMS>): SystemBuilder<PARAMS> {
        this.runFunction = fn;
        return this;
    }

    withRunParameters(params: PARAMS): SystemBuilder<PARAMS> {
        this.parameters = params;
        return this;
    }

    withSetupFunction(fn: TSystemFunction<PARAMS>): SystemBuilder<PARAMS> {
        this.setupFunction = fn;
        return this;
    }
}
