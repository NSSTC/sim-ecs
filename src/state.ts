import ISystem, {TSystemData, TSystemProto} from "./system.spec";
import IState from "./state.spec";
import {ITransitionActions} from "./world.spec";

export * from './state.spec';

export class State implements IState {
    protected _systems: TSystemProto<TSystemData>[];

    constructor(systems: TSystemProto<TSystemData>[] = []) {
        this._systems = systems;
    }

    get systems(): TSystemProto<TSystemData>[] {
        return this._systems;
    }

    activate(world: ITransitionActions): void | Promise<void> {}

    create(actions: ITransitionActions): void | Promise<void> {}

    deactivate(world: ITransitionActions): void | Promise<void> {}

    destroy(actions: ITransitionActions): void | Promise<void> {}
}
