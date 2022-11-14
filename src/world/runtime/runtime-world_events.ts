import {RuntimeWorld} from "./runtime-world";
import {SimECSSystemAddResource, SimECSSystemReplaceResource} from "../../events/internal-events";

export function registerSystemAddResourceEvent(this: RuntimeWorld) {
    this.eventBus.subscribe(SimECSSystemAddResource, event => {
        this.systemResourceMap.set(event.system, {
            paramName: event.paramName,
            resourceType: event.resource,
        });
    });
}

export function registerSystemReplaceResourceEvent(this: RuntimeWorld) {
    this.eventBus.subscribe(SimECSSystemReplaceResource, event => {
        this.systemResourceMap.set(event.system, {
            paramName: event.paramName,
            resourceType: event.resource,
        });
    });
}
