import IPushDownAutomaton from "./pda.spec";

type TStateNode<T> = {
    state: T,
    prevNode?: TStateNode<T>,
};

export class PushDownAutomaton<T> implements IPushDownAutomaton<T> {
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

    push(state: T): void {
        this.currentState = state;
        this.statesTail = {
            prevNode: this.statesTail,
            state,
        };
    }
}
