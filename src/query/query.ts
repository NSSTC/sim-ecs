import {EQueryType, type IQuery} from "./query.spec.ts";
import type {IEntity} from "../entity/entity.ts";
import {addEntitySym, clearEntitiesSym, removeEntitySym, setEntitiesSym} from "./_.ts";

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


export abstract class Query<DESC, DATA> implements IQuery<DESC, DATA> {
    protected queryResult: Map<IEntity, DATA> = new Map();

    constructor(
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
        return this.queryResult.size;
    }

    /** @internal */
    abstract [addEntitySym](entity: Readonly<IEntity>): void;

    /** @internal */
    [clearEntitiesSym]() {
        this.queryResult.clear();
    }

    /** @internal */
    [removeEntitySym](entity: Readonly<IEntity>) {
        this.queryResult.delete(entity)
    }

    /** @internal */
    [setEntitiesSym](entities: Readonly<IterableIterator<Readonly<IEntity>>>) {
        let entity;

        this.queryResult.clear();

        for (entity of entities) {
            this[addEntitySym](entity);
        }
    }

    async execute(handler: (data: DATA) => Promise<void> | void): Promise<void> {
        let data: DATA;
        for (data of this.queryResult.values()) {
            await handler(data);
        }
    }

    getFirst(): DATA | undefined {
        return this.queryResult.values().next().value;
    }

    iter(): IterableIterator<DATA> {
        return this.queryResult.values();
    }

    abstract matchesEntity(entity: Readonly<IEntity>): boolean;

    toArray(): DATA[] {
        return Array.from(this.queryResult.values());
    }
}
