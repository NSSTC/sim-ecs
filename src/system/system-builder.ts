import {ISystemBuilder} from "./system-builder.spec";
import {ISystem, TSystemParameters, TSystemRunFunction, TSystemSetupFunction} from "./system.spec";
import {IIStateProto} from "../state.spec";

export * from "./system-builder.spec";

export class SystemBuilder<PARAMS extends TSystemParameters = TSystemParameters> implements ISystemBuilder<PARAMS> {
    parameters: PARAMS;
    setupFunction: TSystemSetupFunction = () => {};
    states: IIStateProto | IIStateProto[] = [];
    runFunction: TSystemRunFunction<PARAMS> = () => {};


    constructor(params: PARAMS) {
        this.parameters = params;
    }

    build(): ISystem<PARAMS> {
        const self = this;
        return new class implements ISystem<PARAMS> {
            readonly parameters = self.parameters;
            readonly runFunction = self.runFunction;
            readonly setupFunction = self.setupFunction;
            readonly states = self.states;
        }
    }

    runInStates(states: IIStateProto | IIStateProto[]): SystemBuilder<PARAMS> {
        this.states = states;
        return this;
    }

    withRunFunction(fn: TSystemRunFunction<PARAMS>): SystemBuilder<PARAMS> {
        this.runFunction = fn;
        return this;
    }

    withRunParameters(params: PARAMS): SystemBuilder<PARAMS> {
        this.parameters = params;
        return this;
    }

    withSetupFunction(fn: TSystemSetupFunction): SystemBuilder<PARAMS> {
        this.setupFunction = fn;
        return this;
    }
}
