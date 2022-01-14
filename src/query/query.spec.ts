import {TObjectProto, TTypeProto} from "../_.spec";
import {IEntity, TTag} from "../entity.spec";
import {accessDescSym, addEntitySym, clearEntitiesSym, existenceDescSym, removeEntitySym, setEntitiesSym} from "./_";

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


export interface IQuery<DESC, DATA> {
    readonly descriptor: DESC
    readonly queryType: EQueryType

    [addEntitySym](entity: IEntity): void
    [clearEntitiesSym](): void
    [removeEntitySym](entity: IEntity): void
    [setEntitiesSym](entities: IterableIterator<IEntity>): void

    execute(handler: (data: DATA) => Promise<void> | void): Promise<void>
    getFirst(): DATA | undefined
    iter(): IterableIterator<DATA>
    matchesEntity(entity: IEntity): boolean
}

export interface IComponentsQuery<DESC extends IAccessQuery<TObjectProto>> extends IQuery<DESC, TAccessQueryData<DESC>> {}
export interface IEntitiesQuery extends IQuery<TExistenceQuery<TObjectProto>, IEntity> {}
//export interface IQueryProto<D extends IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>> { new(): IQuery<D> }
