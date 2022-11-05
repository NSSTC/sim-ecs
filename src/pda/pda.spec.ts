// todo: this PushDownAutomaton could get its own package on npm
import type {TTypeProto} from "../_.spec";

export interface IPushDownAutomaton<T> {
    readonly state?: T
    clear(): void
    pop(): T | undefined
    push<P extends TTypeProto<T>>(state: P): void
}

export type TPushDownAutomatonProto<T> = { new(): IPushDownAutomaton<T> };
export default IPushDownAutomaton;
