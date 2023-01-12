import type {TObjectProto, TTypeProto} from "../_.spec";
import type {IEntity, TTag} from "../entity/entity.spec";
import type {accessDescSym, addEntitySym, clearEntitiesSym, existenceDescSym, removeEntitySym, setEntitiesSym} from "./_";
import {resultLength} from "./_";

export type TAccessQueryParameter<C extends TObjectProto> = C & IAccessDescriptor<InstanceType<C>>;
export type TOptionalAccessQueryParameter<C extends TObjectProto | undefined> = IAccessDescriptor<C extends TObjectProto ? InstanceType<C> : undefined> & C extends TObjectProto ? C : undefined;
export interface IAccessQuery<C extends TObjectProto> { [componentName: string]: TAccessQueryParameter<C> | TOptionalAccessQueryParameter<C> }

export type TExistenceQueryParameter<C extends TObjectProto> = IExistenceDescriptor<C>;
export type TExistenceQuery<C extends TObjectProto> = Array<TExistenceQueryParameter<C>>;

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

export enum EQueryType {
    Components,
    Entities,
}

export type TAccessQueryData<DESC extends IAccessQuery<TObjectProto>> = {
    [P in keyof DESC]: DESC[P] extends TAccessQueryParameter<TObjectProto>
        ? Required<Omit<InstanceType<DESC[P]>, keyof IAccessDescriptor<object>>>
        : (Required<Omit<InstanceType<DESC[P]>, keyof IAccessDescriptor<object>>> | undefined)
}

export interface IAccessDescriptor<C extends object | undefined> {
    /**
     * @internal
     */
    [accessDescSym]: {
        readonly data?: string
        readonly optional: boolean
        readonly target: TTypeProto<C> | TTag
        readonly targetType: ETargetType
        readonly type: EAccess
    }
}

export interface IExistenceDescriptor<C extends TObjectProto> {
    /**
     * @internal
     */
    [existenceDescSym]: {
        readonly target: Readonly<C> | TTag
        readonly targetType: ETargetType
        readonly type: EExistence
    }
}

export interface IQuery<DESC, DATA> {
    readonly descriptor: Readonly<DESC>
    readonly queryType: EQueryType
    readonly resultLength: number

    /** @internal */
    [addEntitySym](entity: Readonly<IEntity>): void
    /** @internal */
    [clearEntitiesSym](): void
    /** @internal */
    [removeEntitySym](entity: Readonly<IEntity>): void
    /** @internal */
    [resultLength]: number
    /** @internal */
    [setEntitiesSym](entities: Readonly<IterableIterator<Readonly<IEntity>>>): void

    execute(handler: (data: DATA) => Promise<void> | void): Promise<void>
    getFirst(): DATA | undefined
    iter(): IterableIterator<DATA>
    matchesEntity(entity: Readonly<IEntity>): boolean
    toArray(): Array<DATA>
}

export interface IComponentsQuery<DESC extends IAccessQuery<TObjectProto>> extends IQuery<DESC, TAccessQueryData<DESC>> {}
export interface IEntitiesQuery extends IQuery<TExistenceQuery<TObjectProto>, IEntity> {}
