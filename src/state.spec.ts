import ISystem, {TSystemData} from "./system.spec";
import {ITransitionActions} from "./world.spec";

export interface IState {
    /**
     * List of systems which should run when this state is active
     */
    readonly systems: Set<ISystem<TSystemData>>

    /**
     * Called to run tasks for state activation in the PDA
     */
    activate(actions: ITransitionActions): void | Promise<void>

    /**
     * Called to run tasks, when this state is created in the PDA
     * @param actions
     */
    create(actions: ITransitionActions): void | Promise<void>

    /**
     * Called to run deactivation tasks in the PDA
     */
    deactivate(actions: ITransitionActions): void | Promise<void>

    /**
     * Called to run tasks, when this state is destroyed in the PDA
     * @param actions
     */
    destroy(actions: ITransitionActions): void | Promise<void>
}

export type TStateProto = { new(): IState };
export default IState;
