import {IQuery, EQueryType,} from "./query.spec";
import {IEntity} from "../entity";
import {addEntitySym, clearEntitiesSym, removeEntitySym, setEntitiesSym} from "./_";

export * from "./query.spec";
export * from "./query.util";


export abstract class Query<DESC, DATA> implements IQuery<DESC, DATA> {
    protected queryResult: Map<IEntity, DATA> = new Map();

    constructor(
        protected _queryType: EQueryType,
        protected queryDescriptor: DESC,
    ) {}

    get descriptor(): DESC {
        return this.queryDescriptor;
    }

    get queryType(): EQueryType {
        return this._queryType;
    }

    abstract [addEntitySym](entity: IEntity): void;

    [clearEntitiesSym]() {
        this.queryResult.clear();
    }

    [removeEntitySym](entity: IEntity) {
        this.queryResult.delete(entity)
    }

    [setEntitiesSym](entities: IterableIterator<IEntity>) {
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

    getOne(): DATA | undefined {
        return this.queryResult.values().next().value;
    }

    iter(): IterableIterator<DATA> {
        return this.queryResult.values();
    }

    abstract matchesEntity(entity: IEntity): boolean;
}
