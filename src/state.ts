import ISystem from "./system.spec";
import IState from "./state.spec";

export * from './state.spec';

export class State implements IState {
    protected _systems: ISystem[];

    constructor(systems: ISystem[] = []) {
        this._systems = systems;
    }

    get systems(): ISystem[] {
        return this._systems;
    }
}