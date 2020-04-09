import ISystem from "./system.spec";
import {ITransitionActions} from "./world.spec";

export interface IState {
    /**
     * List of systems which should run when this state is active
     */
    readonly systems: Set<ISystem<any>>

    /**
     * Called to run tasks for state activation
     */
    activate(world: ITransitionActions): void | Promise<void>

    /**
     * Called to run clean-up tasks
     */
    deactivate(world: ITransitionActions): void | Promise<void>
}

export type TStateProto = { new(): IState };
export default IState;
