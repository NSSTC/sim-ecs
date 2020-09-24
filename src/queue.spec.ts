import {TTypeProto} from "./_.spec";
import {Entity} from "./entity";

export const access = Symbol();

export enum EAccess {
    META,
    READ,
    WRITE,
    SET,
    UNSET,
}

export type TComponentAccess<C extends Object> = {
    [access]: {
        readonly component: TTypeProto<C>
        readonly type: EAccess
    }
}

export function ReadEntity(): Entity & TComponentAccess<Entity> {
    return Object.assign({}, Entity.prototype, {
        [access]: {
            component: Entity,
            type: EAccess.META,
        },
    });
}

export function Read<C extends Object>(componentPrototype: TTypeProto<C>): C & TComponentAccess<C> {
    return Object.assign({}, componentPrototype.prototype, {
        [access]: {
            component: componentPrototype,
            type: EAccess.READ,
        },
    });
}

export function Write<C extends Object>(componentPrototype: TTypeProto<C>): C & TComponentAccess<C> {
    return Object.assign({}, componentPrototype.prototype, {
        [access]: {
            component: componentPrototype,
            type: EAccess.WRITE,
        },
    });
}

export function With<C extends Object>(componentPrototype: TTypeProto<C>): TComponentAccess<C> {
    return {
        [access]: {
            component: componentPrototype,
            type: EAccess.SET,
        }
    };
}

export function Without<C extends Object>(componentPrototype: TTypeProto<C>): TComponentAccess<C> {
    return {
        [access]: {
            component: componentPrototype,
            type: EAccess.UNSET,
        }
    };
}
