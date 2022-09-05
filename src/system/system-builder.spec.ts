import type {ISystem, TSystemFunction, TSystemParameterDesc} from "./system.spec";

export interface ISystemBuilder<PARAMDESC extends TSystemParameterDesc> {
    parameterDesc: PARAMDESC
    setupFunction: TSystemFunction<PARAMDESC>
    runFunction: TSystemFunction<PARAMDESC>

    /**
     * Build the system as defined in code
     */
    build(): ISystem<PARAMDESC>

    /**
     * Alias for [withName]{@link ISystemBuilder#withName}
     * @param name
     */
    name(name: string): ISystemBuilder<PARAMDESC>

    /**
     * Alias for [withRunFunction]{@link ISystemBuilder#withRunFunction}
     * @param fn
     */
    run(fn: TSystemFunction<PARAMDESC>): ISystemBuilder<PARAMDESC>

    /**
     * Alias for [withSetupFunction]{@link ISystemBuilder#withSetupFunction}
     * @param fn
     */
    setup(fn: TSystemFunction<PARAMDESC>): ISystemBuilder<PARAMDESC>

    /**
     * Give the system a name which is used for registration and error messages
     * @param name
     */
    withName(name: string): ISystemBuilder<PARAMDESC>

    /**
     * Add an executor to the system which is called on every relevant step
     * @param fn
     */
    withRunFunction(fn: TSystemFunction<PARAMDESC>): ISystemBuilder<PARAMDESC>

    /**
     * Add a setup function which is called when the system is instantiated (e.g. on a new world run)
     * @param fn
     */
    withSetupFunction(fn: TSystemFunction<PARAMDESC>): ISystemBuilder<PARAMDESC>
}
