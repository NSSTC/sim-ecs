import type {IState, IIStateProto} from "./state.spec.ts";
import type {ITransitionActions} from "../world/actions.spec.ts";

export * from './state.spec.ts';

export class State implements IState {
    activate(_actions: Readonly<ITransitionActions>): void | Promise<void> {}

    create(_actions: Readonly<ITransitionActions>): void | Promise<void> {}

    deactivate(_actions: Readonly<ITransitionActions>): void | Promise<void> {}

    destroy(_actions: Readonly<ITransitionActions>): void | Promise<void> {}
}

export interface IStateProto extends IIStateProto { new(): State }