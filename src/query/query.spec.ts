import {TObjectProto, TTypeProto} from "../_.spec";
import {IEntity, TTag} from "../entity.spec";
import IWorld from "../world.spec";

export type TAccessQueryParameter<C extends TObjectProto> = C & IAccessDescriptor<InstanceType<C>>;
export type TOptionalAccessQueryParameter<C extends TObjectProto | undefined> = IAccessDescriptor<C extends TObjectProto ? InstanceType<C> : undefined> & C extends TObjectProto ? C : undefined;
export interface IAccessQuery<C extends TObjectProto> { [componentName: string]: TAccessQueryParameter<C> | TOptionalAccessQueryParameter<C> }

export type TExistenceQueryParameter<C extends TObjectProto> = IExistenceDescriptor<C>;
export type TExistenceQuery<C extends TObjectProto> = Array<TExistenceQueryParameter<C>>;

export const addEntitySym = Symbol();
export const clearEntitiesSym = Symbol();
export const removeEntitySym = Symbol();
export const setEntitiesSym = Symbol();
export const accessDescSym: unique symbol = Symbol();
export const existenceDescSym: unique symbol = Symbol();

export enum EAccess {
    meta,
    read,
    write,
}

export enum EExistence {
    set,
    unset,
}

export enum ETargetType {
    component,
    entity,
    tag,
}

export type TAccessQueryData<DESC extends IAccessQuery<TObjectProto>> = {
    [P in keyof DESC]: DESC[P] extends TAccessQueryParameter<TObjectProto>
        ? Required<Omit<InstanceType<DESC[P]>, keyof IAccessDescriptor<Object>>>
        : (Required<Omit<InstanceType<DESC[P]>, keyof IAccessDescriptor<Object>>> | undefined)
}

export interface IAccessDescriptor<C extends Object | undefined> {
    [accessDescSym]: {
        readonly data?: string
        readonly optional: boolean
        readonly target: TTypeProto<C> | TTag
        readonly targetType: ETargetType
        readonly type: EAccess
    }
}

export interface IExistenceDescriptor<C extends TObjectProto> {
    [existenceDescSym]: {
        readonly target: C | TTag
        readonly targetType: ETargetType
        readonly type: EExistence
    }
}


export interface IQuery<
    DESC extends IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>,
    DATA =
        DESC extends TExistenceQuery<TObjectProto>
            ? IEntity
            : DESC extends IAccessQuery<TObjectProto>
                ? TAccessQueryData<DESC>
                : never
    > {
    readonly descriptor: DESC

    execute(handler: (data: DATA) => void): void
    getOne(): DATA | undefined
    iter(world?: IWorld): IterableIterator<DATA>
    matchesEntity(entity: IEntity): boolean
}

export type TQueryProto<D extends IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>> = { new(): IQuery<D> };
