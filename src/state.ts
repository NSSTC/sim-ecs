import ISystem, {TSystemData} from "./system.spec";
import IState from "./state.spec";
import {ITransitionActions} from "./world.spec";

export * from './state.spec';

export class State implements IState {
    protected _systems: Set<ISystem<TSystemData>>;

    constructor(systems: Set<ISystem<TSystemData>> = new Set()) {
        this._systems = systems;
    }

    get systems(): Set<ISystem<TSystemData>> {
        return this._systems;
    }

    activate(world: ITransitionActions): void | Promise<void> {}

    create(actions: ITransitionActions): void | Promise<void> {}

    deactivate(world: ITransitionActions): void | Promise<void> {}

    destroy(actions: ITransitionActions): void | Promise<void> {}
}
