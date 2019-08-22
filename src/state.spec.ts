import ISystem from "./system.spec";

export interface IState {
    readonly systems: ISystem[]
}

export type TStateProto = { new(): IState };
export default IState;
