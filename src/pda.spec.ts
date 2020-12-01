// todo: this PushDownAutomaton could get its own package on npm
import {TTypeProto} from "./_.spec";

export interface IPushDownAutomaton<T, P extends TTypeProto<T>> {
    readonly state?: T
    clear(): void
    pop(): T | undefined
    push(state: P): void
}

export type TPushDownAutomatonProto<T, P> = { new(): IPushDownAutomaton<T, TTypeProto<T>> };
export default IPushDownAutomaton;
