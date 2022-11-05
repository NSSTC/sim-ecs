import type {IState, IIStateProto} from "./state.spec";
import type {ITransitionActions} from "../world/actions.spec";

export * from './state.spec';

export class State implements IState {
    activate(actions: ITransitionActions): void | Promise<void> {}

    create(actions: ITransitionActions): void | Promise<void> {}

    deactivate(actions: ITransitionActions): void | Promise<void> {}

    destroy(actions: ITransitionActions): void | Promise<void> {}
}

export interface IStateProto extends IIStateProto { new(): State }