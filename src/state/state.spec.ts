import type {ITransitionActions} from "../world/actions.spec.ts";

export interface IState {
    /**
     * Called to run tasks for state activation in the PDA
     */
    activate(actions: Readonly<ITransitionActions>): void | Promise<void>

    /**
     * Called to run tasks, when this state is created in the PDA
     * @param actions
     */
    create(actions: Readonly<ITransitionActions>): void | Promise<void>

    /**
     * Called to run deactivation tasks in the PDA
     */
    deactivate(actions: Readonly<ITransitionActions>): void | Promise<void>

    /**
     * Called to run tasks, when this state is destroyed in the PDA
     * @param actions
     */
    destroy(actions: Readonly<ITransitionActions>): void | Promise<void>
}

export interface IIStateProto { new(): IState }
