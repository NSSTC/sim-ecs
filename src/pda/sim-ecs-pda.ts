import {PushDownAutomaton} from "./pda";
import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec";
import type {TTypeProto} from "../_.spec";
import {SimECSPDAPushStateEvent} from "../events/internal-events";
import type {IState} from "../state/state.spec";

export * from "./pda";

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
