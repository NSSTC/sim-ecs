import {type RuntimeWorld} from "./runtime-world.ts";
import type {TTypeProto} from "../../_.spec.ts";
import {
    SimECSAddResourceEvent,
    SimECSRemoveResourceEvent,
    SimECSReplaceResourceEvent,
} from "../../events/internal-events.ts";


export function addResource<T extends object>(
    this: RuntimeWorld,
    obj: Readonly<T> | TTypeProto<T>,
    ...args: ReadonlyArray<unknown>
): T {
    let type: TTypeProto<T>;
    let instance: T;

    if (typeof obj === 'object') {
        type = obj.constructor as TTypeProto<T>;
        instance = obj;
    } else {
        type = obj;
        try {
            instance = new (obj.prototype.constructor.bind(obj, ...args))();
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
    // todo: await in 0.7.0
    this.eventBus.publish(new SimECSAddResourceEvent(type, instance));

    return instance;
}

export function removeResource<T extends object>(this: RuntimeWorld, type: TTypeProto<T>): void {
    if (!this.data.resources.has(type)) {
        throw new Error(`Resource with name "${type.name}" does not exists!`);
    }

    const instance = this.data.resources.get(type)!;
    this.data.resources.delete(type);
    // todo: await in 0.7.0
    this.eventBus.publish(new SimECSRemoveResourceEvent(type, instance as T));
}

export async function replaceResource<T extends object>(
    this: RuntimeWorld,
    obj: Readonly<T> | TTypeProto<T>,
    ...args: ReadonlyArray<unknown>
): Promise<void> {
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

    await this.eventBus.publish(new SimECSReplaceResourceEvent(
        type,
        resourceObj,
    ));
}
