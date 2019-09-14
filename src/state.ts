import ISystem from "./system.spec";
import IState from "./state.spec";
import IWorld from "./world.spec";

export * from './state.spec';

export class State implements IState {
    protected _systems: ISystem[];

    constructor(systems: ISystem[] = []) {
        this._systems = systems;
    }

    get systems(): ISystem[] {
        return this._systems;
    }

    activate(world: IWorld): void {
    }

    deactivate(world: IWorld): void {
    }
}
