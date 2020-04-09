import ISystem from "./system.spec";
import IState from "./state.spec";
import {ITransitionWorld} from "./world.spec";

export * from './state.spec';

export class State implements IState {
    protected _systems: Set<ISystem<any>>;

    constructor(systems: Set<ISystem<any>> = new Set()) {
        this._systems = systems;
    }

    get systems(): Set<ISystem<any>> {
        return this._systems;
    }

    activate(world: ITransitionWorld): void {}
    deactivate(world: ITransitionWorld): void {}
}
