import {PushDownAutomaton} from "./pda.ts";
import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec.ts";
import type {TTypeProto} from "../_.spec.ts";
import {SimECSPDAPopStateEvent, SimECSPDAPushStateEvent} from "../events/internal-events.ts";
import type {IState} from "../state/state.spec.ts";
import type {ITransitionActions} from "../world/actions.spec.ts";

export * from "./pda.ts";

export class SimECSPushDownAutomaton<T extends IState> {
    #pda = new PushDownAutomaton<T>();

    constructor(
        protected world: IRuntimeWorld
    ) {}

    get state(): T | undefined {
        return this.#pda.state;
    }

    clear(actions: Readonly<ITransitionActions>): void {
        while (this.#pda.state !== undefined) {
            this.#pda.pop()!.destroy(actions);
        }

        this.#pda.clear();
    }

    async pop(): Promise<T | undefined> {
        const oldState = this.#pda.pop();
        await this.world.eventBus.publish(new SimECSPDAPopStateEvent(oldState, this.#pda.state))
        return oldState as T | undefined;
    }

    async push<P extends TTypeProto<T>>(State: P): Promise<T> {
        const oldState = this.state;
        const newState = this.#pda.push(State);
        await this.world.eventBus.publish(new SimECSPDAPushStateEvent(oldState, newState));
        return newState;
    }
}
