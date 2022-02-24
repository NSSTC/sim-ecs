import {TObjectProto, TTypeProto} from "../_.spec";
import {IEntity, TTag} from "../entity.spec";
import {accessDescSym, addEntitySym, clearEntitiesSym, existenceDescSym, removeEntitySym, setEntitiesSym} from "./_";

export type TAccessQueryParameter<C extends TObjectProto | Array<TObjectProto> | ReadonlyArray<TObjectProto>> = C & (C extends Array<TObjectProto>
    ? IAccessDescriptor<InstanceType<C[0]>>
    : (C extends TObjectProto ? IAccessDescriptor<Array<InstanceType<C>>> : never)
);
export type TOptionalAccessQueryParameter<C extends TObjectProto | Array<TObjectProto> | undefined> = IAccessDescriptor<C extends TObjectProto ? InstanceType<C> : undefined> & C extends TObjectProto ? C : undefined;
export interface IAccessQuery<C extends TObjectProto | Array<TObjectProto>> { [componentName: string]: TAccessQueryParameter<C> | TOptionalAccessQueryParameter<C> }

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

export type TAccessQueryData<DESC extends IAccessQuery<TObjectProto | Array<TObjectProto>>> = {
    [P in keyof DESC]: DESC[P] extends TAccessQueryParameter<Array<TObjectProto>>
        ? Required<Omit<Array<InstanceType<DESC[P][0]>>, keyof IAccessDescriptor<Object>>>
        : DESC[P] extends TAccessQueryParameter<TObjectProto>
            ? Required<Omit<InstanceType<DESC[P]>, keyof IAccessDescriptor<Object>>>
            : DESC[P] extends Array<TObjectProto>
                ? (Required<Omit<InstanceType<DESC[P][0]>, keyof IAccessDescriptor<Object>>> | undefined)
                : DESC[P] extends TObjectProto ? (Required<Omit<InstanceType<DESC[P]>, keyof IAccessDescriptor<Object>>> | undefined) : never
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

export interface IComponentsQuery<DESC extends IAccessQuery<TObjectProto | Array<TObjectProto>>> extends IQuery<DESC, TAccessQueryData<DESC>> {}
export interface IEntitiesQuery extends IQuery<TExistenceQuery<TObjectProto>, IEntity> {}
