import {ISystem, TSystemParameters, TSystemFunction} from "./system.spec";
import {IIStateProto} from "../state.spec";


export interface ISystemBuilder<PARAMS extends TSystemParameters> {
    parameters: PARAMS
    setupFunction: TSystemFunction<PARAMS>
    states: IIStateProto | IIStateProto[]
    runFunction: TSystemFunction<PARAMS>

    build(): ISystem<PARAMS>
    runInStates(state0: IIStateProto | IIStateProto[], ...states: IIStateProto[]): ISystemBuilder<PARAMS>
    // todo: only take "blueprint" parameters here
    withRunParameters(params: TSystemParameters): ISystemBuilder<PARAMS>
    withRunFunction(fn: TSystemFunction<PARAMS>): ISystemBuilder<PARAMS>
    withSetupFunction(fn: TSystemFunction<PARAMS>): ISystemBuilder<PARAMS>
}
