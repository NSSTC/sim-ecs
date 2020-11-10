import {TSystemData, TSystemProto} from "./system.spec";
import IState from "./state.spec";
import {ITransitionActions} from "./world.spec";

export * from './state.spec';

export class State implements IState {
    constructor(
        protected _systems: TSystemProto<TSystemData>[] = []
    ) {}

    get systems(): TSystemProto<TSystemData>[] {
        return this._systems;
    }

    activate(actions: ITransitionActions): void | Promise<void> {}

    create(actions: ITransitionActions): void | Promise<void> {}

    deactivate(actions: ITransitionActions): void | Promise<void> {}

    destroy(actions: ITransitionActions): void | Promise<void> {}
}
