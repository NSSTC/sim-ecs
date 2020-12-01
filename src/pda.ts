import IPushDownAutomaton from "./pda.spec";
import {TTypeProto} from "./_.spec";

type TStateNode<T> = {
    state: T,
    prevNode?: TStateNode<T>,
};

export class PushDownAutomaton<T, P extends TTypeProto<T>> implements IPushDownAutomaton<T, P> {
    protected currentState?: T;
    protected statesTail?: TStateNode<T>;

    get state(): T | undefined {
        return this.currentState;
    }

    clear(): void {
        this.currentState = undefined;
        this.statesTail = undefined;
    }

    pop(): T | undefined {
        if (!this.statesTail) return;

        const oldTail = this.statesTail;

        this.statesTail = this.statesTail.prevNode;
        this.currentState = this.statesTail?.state;

        return oldTail.state;
    }

    push(State: P): void {
        this.currentState = new State();
        this.statesTail = {
            prevNode: this.statesTail,
            state: this.currentState,
        };
    }
}
