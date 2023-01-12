import {EQueryType, type IQuery} from "./query.spec";
import type {IEntity} from "../entity/entity";
import {addEntitySym, clearEntitiesSym, removeEntitySym, resultLength, setEntitiesSym, TTypedArray} from "./_";

export * from "./query.spec";
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
} from "./query.util";


export abstract class Query<DESC, DATA> implements IQuery<DESC, DATA> {
    protected queryResult: Map<keyof DATA, Map<keyof DATA[keyof DATA], Array<DATA[keyof DATA]> | TTypedArray>> = new Map();
    /** @internal */
    [resultLength] = 0;

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
        return this[resultLength];
    }

    /** @internal */
    abstract [addEntitySym](entity: Readonly<IEntity>): void;

    /** @internal */
    [clearEntitiesSym]() {
        this.queryResult.clear();
        this[resultLength] = 0;
    }

    /** @internal */
    [removeEntitySym](entity: Readonly<IEntity>) {
        this.queryResult.delete(entity);
        this[resultLength]--;
    }

    /** @internal */
    [setEntitiesSym](entities: IterableIterator<Readonly<IEntity>>) {
        let entity;

        this.queryResult.clear();

        for (entity of entities) {
            this[addEntitySym](entity);
        }
    }

    async execute(handler: (data: DATA) => Promise<void> | void): Promise<void> {
        let data: DATA;

        for (let i = 0; i < this.resultLength; i++) {
            
        }

            await handler(data);
    }

    getFirst(): DATA | undefined {
        return this.queryResult.values().next().value;
    }

    iter(): IterableIterator<DATA> {
        //return this.queryResult.values();
        return [].values(); // todo
    }

    abstract matchesEntity(entity: Readonly<IEntity>): boolean;

    toArray(): DATA[] {
        //return Array.from(this.queryResult.values());
        return []; // todo
    }
}
