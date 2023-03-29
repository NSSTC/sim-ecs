import type {ISystem, TSystemFunction, TSystemParameterDesc} from "./system.spec.ts";

export interface ISystemBuilder<PARAMDESC extends TSystemParameterDesc> {
    parameterDesc: Readonly<PARAMDESC>
    setupFunction: TSystemFunction<Readonly<PARAMDESC>>
    runFunction: TSystemFunction<Readonly<PARAMDESC>>

    /**
     * Build the system as defined in code
     */
    build(): Readonly<ISystem<Readonly<PARAMDESC>>>

    /**
     * Alias for [withName]{@link ISystemBuilder#withName}
     * @param name
     */
    name(name: string): ISystemBuilder<Readonly<PARAMDESC>>

    /**
     * Alias for [withRunFunction]{@link ISystemBuilder#withRunFunction}
     * @param fn
     */
    run(fn: TSystemFunction<Readonly<PARAMDESC>>): ISystemBuilder<Readonly<PARAMDESC>>

    /**
     * Alias for [withSetupFunction]{@link ISystemBuilder#withSetupFunction}
     * @param fn
     */
    setup(fn: TSystemFunction<Readonly<PARAMDESC>>): ISystemBuilder<Readonly<PARAMDESC>>

    /**
     * Give the system a name which is used for registration and error messages
     * @param name
     */
    withName(name: string): ISystemBuilder<Readonly<PARAMDESC>>

    /**
     * Add an executor to the system which is called on every relevant step
     * @param fn
     */
    withRunFunction(fn: TSystemFunction<Readonly<PARAMDESC>>): ISystemBuilder<Readonly<PARAMDESC>>

    /**
     * Add a setup function which is called when the system is instantiated (e.g. on a new world run)
     * @param fn
     */
    withSetupFunction(fn: TSystemFunction<Readonly<PARAMDESC>>): ISystemBuilder<Readonly<PARAMDESC>>
}
