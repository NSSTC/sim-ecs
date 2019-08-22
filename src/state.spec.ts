import ISystem from "./system.spec";

export interface IState {
    /**
     * List of systems which should run when this state is active
     */
    readonly systems: ISystem[]
}

export type TStateProto = { new(): IState };
export default IState;
