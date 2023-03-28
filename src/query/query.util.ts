import type {
    IAccessDescriptor,
    IExistenceDescriptor,
    TAccessQueryParameter,
    TOptionalAccessQueryParameter
} from "./query.spec.ts";
import {EAccess, EExistence, ETargetType} from "./query.spec.ts";
import type {TObjectProto, TTypeProto} from "../_.spec.ts";
import type {IEntity, TTag} from "../entity/entity.spec.ts";
import {Entity} from "../entity/entity.ts";
import {accessDescSym, existenceDescSym} from "./_.ts";

export function ReadEntity(uuid?: string): TAccessQueryParameter<TTypeProto<Readonly<IEntity>>> {
    return Object.assign({}, Entity, {
        [accessDescSym]: {
            optional: false,
            data: uuid,
            target: Entity,
            targetType: ETargetType.entity,
            type: EAccess.meta,
        },
    } as IAccessDescriptor<Entity>);
}

export function Read<C extends object>(componentPrototype: TTypeProto<C>): TAccessQueryParameter<TTypeProto<Readonly<C>>> {
    return Object.assign({}, componentPrototype.prototype, {
        [accessDescSym]: {
            optional: false,
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.read,
        },
    } as IAccessDescriptor<C>);
}

export function ReadOptional<C extends object>(componentPrototype: TTypeProto<C>): TOptionalAccessQueryParameter<TTypeProto<Readonly<C>>> {
    return Object.assign({}, componentPrototype.prototype, {
        [accessDescSym]: {
            optional: true,
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.read,
        },
    } as IAccessDescriptor<C>);
}

export function Write<C extends object>(componentPrototype: TTypeProto<C>): TAccessQueryParameter<TTypeProto<C>> {
    return Object.assign({}, componentPrototype.prototype, {
        [accessDescSym]: {
            optional: false,
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.write,
        },
    } as IAccessDescriptor<C>);
}

export function WriteOptional<C extends object>(componentPrototype: TTypeProto<C>): TOptionalAccessQueryParameter<TTypeProto<C>> {
    return Object.assign({}, componentPrototype.prototype, {
        [accessDescSym]: {
            optional: true,
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.write,
        },
    } as IAccessDescriptor<C>);
}

export function With<C extends object>(componentPrototype: TTypeProto<C>): IExistenceDescriptor<TTypeProto<C>> {
    return {
        [existenceDescSym]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EExistence.set,
        }
    };
}

export function WithTag(tag: TTag): TAccessQueryParameter<TObjectProto> & IExistenceDescriptor<TObjectProto> {
    return {
        [accessDescSym]: {
            optional: false,
            target: tag,
            targetType: ETargetType.tag,
            type: EAccess.meta,
        },
        [existenceDescSym]: {
            target: tag,
            targetType: ETargetType.tag,
            type: EExistence.set,
        }
    } as TAccessQueryParameter<TObjectProto> & IExistenceDescriptor<TObjectProto>;
}

export function Without<C extends object>(componentPrototype: TTypeProto<C>): IExistenceDescriptor<TTypeProto<C>> {
    return {
        [existenceDescSym]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EExistence.unset,
        }
    };
}

export function WithoutTag(tag: TTag): IExistenceDescriptor<TObjectProto> {
    return {
        [existenceDescSym]: {
            target: tag,
            targetType: ETargetType.tag,
            type: EExistence.unset,
        }
    };
}
