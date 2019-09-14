import ISystem from "./system.spec";

export interface IState {
    /**
     * List of systems which should run when this state is active
     */
    readonly systems: ISystem[]

    /**
     * Called to run tasks for state activation
     */
    activate(): void | Promise<void>

    /**
     * Called to run clean-up tasks
     */
    deactivate(): void | Promise<void>
}

export type TStateProto = { new(): IState };
export default IState;
