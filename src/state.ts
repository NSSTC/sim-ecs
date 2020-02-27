import ISystem from "./system.spec";
import IState from "./state.spec";
import IWorld, {ITransitionWorld} from "./world.spec";

export * from './state.spec';

export class State implements IState {
    protected _systems: ISystem[];

    constructor(systems: ISystem[] = []) {
        this._systems = systems;
    }

    get systems(): ISystem[] {
        return this._systems;
    }

    activate(world: ITransitionWorld): void {
    }

    deactivate(world: ITransitionWorld): void {
    }
}
