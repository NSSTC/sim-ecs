import {RuntimeWorld} from "./runtime-world";
import {SimECSSystemAddResource} from "../../events/internal-events";

export function registerSystemAddResourceEvent(this: RuntimeWorld) {
    this.eventBus.subscribe(SimECSSystemAddResource, event => {
        this.systemResourceMap.set(event.system, {
            paramName: event.paramName,
            resourceType: event.resource,
        });
    });
}
