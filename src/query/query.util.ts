// todo: this is dangerous! The exposed interface should be reduced to prevent direct modifications in systems
import {
    EAccess,
    EExistence,
    ETargetType,
    IAccessDescriptor,
    IExistenceDescriptor,
    TAccessQueryParameter,
    TOptionalAccessQueryParameter
} from "./query.spec";
import {TObjectProto, TTypeProto} from "../_.spec";
import {IEntity, TTag} from "../entity.spec";
import {Entity} from "../entity";
import {accessDescSym, existenceDescSym} from "./_";

export function ArrayOf<C extends Object>(componentPrototype: TTypeProto<C>): Array<TTypeProto<C>> {
    return [componentPrototype];
}

export function ReadEntity(uuid?: string): TAccessQueryParameter<TTypeProto<Readonly<IEntity>>> {
    return Object.assign({}, Entity, {
        [accessDescSym]: {
            data: uuid,
            target: Entity,
            targetType: ETargetType.entity,
            type: EAccess.meta,
        },
    } as IAccessDescriptor<Entity>);
}

export function Read<C extends Object, T extends TTypeProto<C> | Array<TTypeProto<C>>>(componentPrototype: T): T extends Array<TTypeProto<C>> ? TAccessQueryParameter<ReadonlyArray<any>> : TAccessQueryParameter<TTypeProto<Readonly<C>>> {
    return Object.assign({}, Array.isArray(componentPrototype) ? componentPrototype[0].prototype : componentPrototype.prototype, {
        [accessDescSym]: {
            optional: false,
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.read,
        },
    } as IAccessDescriptor<C>);
}

export function ReadOptional<C extends Object, T extends TTypeProto<C> | Array<TTypeProto<C>>>(componentPrototype: T): TOptionalAccessQueryParameter<TTypeProto<Readonly<C>>> {
    return Object.assign({}, Array.isArray(componentPrototype) ? componentPrototype[0].prototype : componentPrototype.prototype, {
        [accessDescSym]: {
            optional: true,
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.read,
        },
    } as IAccessDescriptor<C>);
}

export function Write<C extends Object, T extends TTypeProto<C> | Array<TTypeProto<C>>>(componentPrototype: T): TAccessQueryParameter<T> {
    return Object.assign({}, Array.isArray(componentPrototype) ? componentPrototype[0].prototype : componentPrototype.prototype, {
        [accessDescSym]: {
            optional: false,
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.write,
        },
    } as IAccessDescriptor<C>);
}

export function WriteOptional<C extends Object, T extends TTypeProto<C> | Array<TTypeProto<C>>>(componentPrototype: T): TOptionalAccessQueryParameter<T> {
    return Object.assign({}, Array.isArray(componentPrototype) ? componentPrototype[0].prototype : componentPrototype.prototype, {
        [accessDescSym]: {
            optional: true,
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.write,
        },
    } as IAccessDescriptor<C>);
}

export function With<C extends Object, T extends TTypeProto<C> | Array<TTypeProto<C>>>(componentPrototype: T): T extends Array<TTypeProto<C>> ? IExistenceDescriptor<T[0]> : IExistenceDescriptor<TTypeProto<C>> {
    return {
        [existenceDescSym]: {
            target: Array.isArray(componentPrototype) ? componentPrototype[0] : componentPrototype,
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

export function Without<C extends Object, T extends TTypeProto<C> | Array<TTypeProto<C>>>(componentPrototype: T): T extends Array<TTypeProto<C>> ? IExistenceDescriptor<T[0]> : IExistenceDescriptor<TTypeProto<C>> {
    return {
        [existenceDescSym]: {
            target: Array.isArray(componentPrototype) ? componentPrototype[0] : componentPrototype,
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
