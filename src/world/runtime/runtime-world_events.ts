import {RuntimeWorld} from "./runtime-world.ts";
import {SimECSSystemAddResource} from "../../events/internal-events.ts";

export function registerSystemAddResourceEvent(this: RuntimeWorld) {
    this.eventBus.subscribe(SimECSSystemAddResource, event => {
        this.systemResourceMap.set(event.system, {
            paramName: event.paramName,
            resourceType: event.resource,
        });
    });
}
