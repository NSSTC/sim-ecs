import type {IState, IIStateProto} from "./state.spec";
import type {ITransitionActions} from "../world/actions.spec";

export * from './state.spec';

export class State implements IState {
    activate(actions: Readonly<ITransitionActions>): void | Promise<void> {}

    create(actions: Readonly<ITransitionActions>): void | Promise<void> {}

    deactivate(actions: Readonly<ITransitionActions>): void | Promise<void> {}

    destroy(actions: Readonly<ITransitionActions>): void | Promise<void> {}
}

export interface IStateProto extends IIStateProto { new(): State }