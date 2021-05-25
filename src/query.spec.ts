import {TTypeProto} from "./_.spec";
import {Entity, TTag} from "./entity";

export const access = Symbol();

export enum EAccess {
    meta,
    read,
    set,
    unset,
    write,
}

export enum ETargetType {
    component,
    tag,
}

export type TAccessDescriptor<C extends Object> = {
    [access]: {
        readonly target: TTypeProto<C> | TTag
        readonly targetType: ETargetType
        readonly type: EAccess
    }
}

export function ReadEntity(): Entity & TAccessDescriptor<Entity> {
    return Object.assign({}, Entity.prototype, {
        [access]: {
            target: Entity,
            targetType: ETargetType.component,
            type: EAccess.meta,
        },
    });
}

export function Read<C extends Object>(componentPrototype: TTypeProto<C>): C & TAccessDescriptor<C> {
    return Object.assign({}, componentPrototype.prototype, {
        [access]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.read,
        },
    });
}

export function Write<C extends Object>(componentPrototype: TTypeProto<C>): C & TAccessDescriptor<C> {
    return Object.assign({}, componentPrototype.prototype, {
        [access]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.write,
        },
    });
}

export function With<C extends Object>(componentPrototype: TTypeProto<C>): TAccessDescriptor<C> {
    return {
        [access]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.set,
        }
    };
}

export function WithTag(tag: TTag): TAccessDescriptor<Object> {
    return {
        [access]: {
            target: tag,
            targetType: ETargetType.tag,
            type: EAccess.set,
        }
    };
}

export function Without<C extends Object>(componentPrototype: TTypeProto<C>): TAccessDescriptor<C> {
    return {
        [access]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.unset,
        }
    };
}

export function WithoutTaq(tag: TTag): TAccessDescriptor<Object> {
    return {
        [access]: {
            target: tag,
            targetType: ETargetType.tag,
            type: EAccess.unset,
        }
    };
}
