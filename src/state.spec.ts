import ISystem from "./system.spec";
import {ITransitionWorld} from "./world.spec";

export interface IState {
    /**
     * List of systems which should run when this state is active
     */
    readonly systems: Set<ISystem<any>>

    /**
     * Called to run tasks for state activation
     */
    activate(world: ITransitionWorld): void | Promise<void>

    /**
     * Called to run clean-up tasks
     */
    deactivate(world: ITransitionWorld): void | Promise<void>
}

export type TStateProto = { new(): IState };
export default IState;
