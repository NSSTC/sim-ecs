import ISystem from "./system.spec";
import IState from "./state.spec";
import {ITransitionWorld} from "./world.spec";

export * from './state.spec';

export class State implements IState {
    protected _systems: ISystem<any>[];

    constructor(systems: ISystem<any>[] = []) {
        this._systems = systems;
    }

    get systems(): ISystem<any>[] {
        return this._systems;
    }

    activate(world: ITransitionWorld): void {}
    deactivate(world: ITransitionWorld): void {}
}
