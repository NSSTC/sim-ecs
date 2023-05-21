import type IPushDownAutomaton from "./pda.spec.ts";
import type {TTypeProto} from "../_.spec.ts";

export * from "./pda.spec.ts";

type TStateNode<T> = {
    state: T,
    prevNode?: TStateNode<T>,
};

export class PushDownAutomaton<T> implements IPushDownAutomaton<T> {
    protected currentState?: T;
    protected statesTail?: TStateNode<T>;

    get state(): Readonly<T | undefined> {
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

    push<P extends TTypeProto<T>>(State: P): T {
        this.currentState = new State();
        this.statesTail = {
            prevNode: this.statesTail,
            state: this.currentState,
        };

        return this.currentState;
    }
}
