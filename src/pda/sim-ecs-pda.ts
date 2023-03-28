import {PushDownAutomaton} from "./pda.ts";
import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec.ts";
import type {TTypeProto} from "../_.spec.ts";
import {SimECSPDAPushStateEvent} from "../events/internal-events.ts";
import type {IState} from "../state/state.spec.ts";

export * from "./pda.ts";

export class SimECSPushDownAutomaton<T extends IState> extends PushDownAutomaton<T> {
    constructor(
        protected world: IRuntimeWorld
    ) {
        super();
    }

    push<P extends TTypeProto<T>>(State: P): Promise<void> {
        super.push(State);
        return this.world.eventBus.publish(new SimECSPDAPushStateEvent(State));
    }
}
