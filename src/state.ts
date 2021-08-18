import {IState, IIStateProto} from "./state.spec";
import {ITransitionActions} from "./world.spec";
import {IISystemProto} from "./system";

export * from './state.spec';

export const systemsSym = Symbol();

export class State implements IState {
    static [systemsSym]: IISystemProto[] = [];

    activate(actions: ITransitionActions): void | Promise<void> {}

    create(actions: ITransitionActions): void | Promise<void> {}

    deactivate(actions: ITransitionActions): void | Promise<void> {}

    destroy(actions: ITransitionActions): void | Promise<void> {}
}

export interface IStateProto extends IIStateProto { new(): State }