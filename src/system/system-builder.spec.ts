import {ISystem, TSystemParameters, TSystemFunction} from "./system.spec";

export interface ISystemBuilder<PARAMS extends TSystemParameters> {
    parameters: PARAMS
    setupFunction: TSystemFunction<PARAMS>
    runFunction: TSystemFunction<PARAMS>

    build(): ISystem<PARAMS>
    // todo: only take "blueprint" parameters here
    withRunParameters(params: TSystemParameters): ISystemBuilder<PARAMS>
    withRunFunction(fn: TSystemFunction<PARAMS>): ISystemBuilder<PARAMS>
    withSetupFunction(fn: TSystemFunction<PARAMS>): ISystemBuilder<PARAMS>
}
