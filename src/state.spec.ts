import ISystem from "./system.spec";
import IWorld from "./world.spec";

export interface IState {
    /**
     * List of systems which should run when this state is active
     */
    readonly systems: ISystem[]

    /**
     * Called to run tasks for state activation
     */
    activate(world: IWorld): void | Promise<void>

    /**
     * Called to run clean-up tasks
     */
    deactivate(world: IWorld): void | Promise<void>
}

export type TStateProto = { new(): IState };
export default IState;
