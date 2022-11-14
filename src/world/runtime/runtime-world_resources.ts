import {type RuntimeWorld} from "./runtime-world";
import type {TTypeProto} from "../../_.spec";
import {systemRunParamSym} from "../../system/_";
import {TSystemParameterDesc} from "../../system/system.spec";
import {SimECSReplaceResourceEvent, SimECSSystemReplaceResource} from "../../events/internal-events";

export function addResource<T extends Object>(this: RuntimeWorld, obj: T | TTypeProto<T>, ...args: Array<unknown>): T {
    let type: TTypeProto<T>;
    let instance: T;

    if (typeof obj === 'object') {
        type = obj.constructor as TTypeProto<T>;
        instance = obj;
    } else {
        type = obj;
        try {
            instance = new (obj.prototype.constructor.bind(obj, ...Array.from(arguments).slice(1)))();
        } catch (err: any) {
            if (err instanceof TypeError && err.message.startsWith('Illegal constructor')) {
                // @ts-ignore This may happen for some built-in constructors. They must be replaced later!
                instance = null;
            } else {
                throw err;
            }
        }
    }

    if (this.data.resources.has(type)) {
        throw new Error(`Resource with name "${type.name}" already exists!`);
    }

    this.data.resources.set(type, instance);
    return instance;
}

export function replaceResource<T extends Object>(this: RuntimeWorld, obj: T | TTypeProto<T>, ...args: Array<unknown>): void {
    let type: TTypeProto<T>;

    if (typeof obj === 'object') {
        type = obj.constructor as TTypeProto<T>;
    } else {
        type = obj;
    }

    if (!this.data.resources.has(type)) {
        throw new Error(`Resource with name "${type.name}" does not exists!`);
    }

    this.data.resources.delete(type);
    const resourceObj = this.addResource(obj, ...args);

    this.eventBus.publish(new SimECSReplaceResourceEvent(
        type,
        resourceObj,
    ));

    { // Also replace the resources for all systems
        let system, resourceDesc;
        let systemParamName, systemParamDesc;
        for ([system, resourceDesc] of this.systemResourceMap) {
            if (resourceDesc.resourceType.name == type.name) {
                (system[systemRunParamSym] as TSystemParameterDesc)[resourceDesc.paramName] = resourceObj;
                this.eventBus.publish(new SimECSSystemReplaceResource(
                    system,
                    resourceDesc.paramName,
                    resourceDesc.resourceType,
                ));
            }
        }
    }
}
