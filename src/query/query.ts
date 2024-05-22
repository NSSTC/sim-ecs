import {EQueryType, type IQuery, IQueryDescriptor, TComparator} from "./query.spec.ts";
import type {IEntity} from "../entity/entity.spec.ts";
import {addEntitySym, clearEntitiesSym, entitySym, removeEntitySym, runSortSym, setEntitiesSym} from "./_.ts";

export * from "./query.spec.ts";
export {
    Read,
    ReadEntity,
    ReadOptional,
    With,
    WithTag,
    Without,
    Write,
    WithoutTag,
    WriteOptional,
} from "./query.util.ts";


export abstract class Query<DESC, DATA> implements IQuery<DESC, DATA>, IQueryDescriptor<DESC, DATA> {
    protected isSortDirty = false;
    protected queryResult: Array<DATA & { [entitySym]: IEntity }> = [];
    protected sortComparator: TComparator<DATA> | undefined;

    protected constructor(
        protected _queryType: EQueryType,
        protected queryDescriptor: Readonly<DESC>,
    ) {}

    get descriptor(): Readonly<DESC> {
        return this.queryDescriptor;
    }

    get queryType(): EQueryType {
        return this._queryType;
    }

    get resultLength(): number {
        return this.queryResult.length;
    }

    /** @internal */
    abstract [addEntitySym](entity: Readonly<IEntity>): void;

    /** @internal */
    [clearEntitiesSym]() {
        this.queryResult.length = 0;
    }

    /** @internal */
    [removeEntitySym](entity: Readonly<IEntity>): void {
        const entityIndex = this.queryResult.findIndex(data => data[entitySym] === entity);

        if (entityIndex < 0) {
            return;
        }

        this.queryResult.splice(entityIndex, 1);
    }

    /** @internal */
    [runSortSym](): void {
        if (!this.isSortDirty || !this.sortComparator) {
            return;
        }

        this.queryResult = this.queryResult.sort(this.sortComparator);
        this.isSortDirty = false;
    }

    /** @internal */
    [setEntitiesSym](entities: Readonly<IterableIterator<Readonly<IEntity>>>): void {
        let entity;

        this[clearEntitiesSym]();

        for (entity of entities) {
            this[addEntitySym](entity);
        }
    }

    async execute(handler: (data: DATA) => Promise<void> | void): Promise<void> {
        let data;
        for (data of this.queryResult) {
            await handler(data);
        }
    }

    getFirst(): DATA | undefined {
        return this.queryResult[0];
    }

    iter(): IterableIterator<DATA> {
        return this.queryResult.values();
    }

    abstract matchesEntity(entity: Readonly<IEntity>): boolean;

    sort(comparator: TComparator<DATA>): IQueryDescriptor<DESC, DATA> {
        this.sortComparator = comparator;
        return this;
    }

    toArray(): DATA[] {
        return [...this.queryResult];
    }
}
