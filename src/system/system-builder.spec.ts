import {ISystem, TSystemParameters, TSystemRunFunction, TSystemSetupFunction} from "./system.spec";
import {IIStateProto} from "../state.spec";


export interface ISystemBuilder<PARAMS extends TSystemParameters> {
    parameters: PARAMS
    setupFunction: TSystemSetupFunction
    states: IIStateProto | IIStateProto[]
    runFunction: TSystemRunFunction<PARAMS>

    build(): ISystem<PARAMS>
    runInStates(states: IIStateProto | IIStateProto[]): ISystemBuilder<PARAMS>
    // todo: only take "blueprint" parameters here
    withRunParameters(params: TSystemParameters): ISystemBuilder<PARAMS>
    withRunFunction(fn: TSystemRunFunction<PARAMS>): ISystemBuilder<PARAMS>
    withSetupFunction(fn: TSystemSetupFunction): ISystemBuilder<PARAMS>
}
