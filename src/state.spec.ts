import ISystem from "./system.spec";

export interface IState {
    readonly systems: ISystem[]
}

export default IState;
