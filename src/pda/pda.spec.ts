// todo: this PushDownAutomaton could get its own package on npm
import type {TTypeProto} from "../_.spec.ts";

export interface IPushDownAutomaton<T> {
    /**
     * Number of states in the PDA
     */
    readonly size: number
    /**
     * Current state
     */
    readonly state?: T

    /**
     * Clear the PDA by GC-ing all entries
     */
    clear(): void

    /**
     * Remove the current state from the stack and return it
     */
    pop(): T | undefined

    /**
     * Put a new state on the stack and return a ref to the created instance
     * @param state
     */
    push<P extends TTypeProto<T>>(state: P): T
}

export type TPushDownAutomatonProto<T> = { new(): IPushDownAutomaton<T> };
export default IPushDownAutomaton;
