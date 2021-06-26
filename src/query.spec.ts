import {TTypeProto} from "./_.spec";
import {TTag} from "./entity";

export type TAccessQueryParameter<C extends TTypeProto<Object>> = C & IAccessDescriptor<InstanceType<C>>;
export interface IAccessQuery<C extends TTypeProto<Object>> { [componentName: string]: TAccessQueryParameter<C> }

export type TExistenceQueryParameter<C extends TTypeProto<Object>> = IExistenceDescriptor<C>;
export type TExistenceQuery<C extends TTypeProto<Object>> = Array<TExistenceQueryParameter<C>>;

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

export interface IAccessDescriptor<C extends Object> {
    [accessDescSym]: {
        readonly target: TTypeProto<C> | TTag
        readonly targetType: ETargetType
        readonly type: EAccess
    }
}

export interface IExistenceDescriptor<C extends TTypeProto<Object>> {
    [existenceDescSym]: {
        readonly target: C | TTag
        readonly targetType: ETargetType
        readonly type: EExistence
    }
}

/*
export interface IQuery<D extends IAccessQueryResult<Object> | TExistenceQueryResult> {
    iter(): IterableIterator<D extends Array<infer T> ? IEntity : { [P in keyof D]: Required<Omit<InstanceType<D[P]>, keyof IAccessDescriptor<Object>>> }>
    matchesEntity(entity: IEntity): boolean
}

export type TQueryProto<D extends IAccessQueryResult<Object> | TExistenceQueryResult> = { new(): IQuery<D> };
*/