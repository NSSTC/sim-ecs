import {ISystem} from "./system.spec";
import {
    SimECSReplaceResourceEvent,
} from "../events/internal-events.ts";
import {RuntimeWorld} from "../world/runtime/runtime-world.ts";
import {TObjectProto, TTypeProto} from "../_.spec.ts";
import {ISystemContext} from "./system_context.spec.ts";
import {TSubscriber} from "../events/_.ts";


export function setRuntimeContext(this: ISystem & ISystemContext, context: RuntimeWorld): void {
    {
        const handler: TSubscriber<TTypeProto<SimECSReplaceResourceEvent<TObjectProto>>> = handleSimECSReplaceResourceEvent.bind(this);
        this._handlers.set(SimECSReplaceResourceEvent, handler);
        context.eventBus.subscribe(SimECSReplaceResourceEvent, handler);
    }

    this._context = context;
}

export function unsetRuntimeContext(this: ISystem & ISystemContext, context: RuntimeWorld): void {
    let handler;
    for (handler of this._handlers) {
        context.eventBus.unsubscribe(handler[0], handler[1]);
    }

    this._context = undefined;
}


function handleSimECSReplaceResourceEvent(this: ISystem, event: Readonly<SimECSReplaceResourceEvent<TObjectProto>>) {
    Object.entries(this.parameterDesc)
        .filter(param => param[1] instanceof event.resourceType)
        .forEach(param => this.parameterDesc[param[0]] = event.resourceInstance);
}
