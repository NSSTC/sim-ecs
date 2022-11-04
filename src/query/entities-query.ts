import type {IEntitiesQuery, TExistenceQuery} from "./query.spec";
import {EExistence, EQueryType, ETargetType} from "./query.spec";
import {Query} from "./query";
import type {IEntity, TTag} from "../entity.spec";
import {addEntitySym, existenceDescSym} from "./_";
import type {TObjectProto} from "../_.spec";

export class EntitiesQuery extends Query<TExistenceQuery<TObjectProto>, IEntity> implements IEntitiesQuery {
    constructor(
        protected queryDesc: TExistenceQuery<TObjectProto>
    ) {
        super(EQueryType.Entities, queryDesc);
    }

    [addEntitySym](entity: IEntity): void {
        if (this.matchesEntity(entity)) {
            this.queryResult.set(entity, entity);
        }
    }

    matchesEntity(entity: IEntity): boolean {
        let componentDesc;

        for (componentDesc of this.queryDescriptor) {
            if (
                componentDesc[existenceDescSym].targetType == ETargetType.tag
                && entity.hasTag(componentDesc[existenceDescSym].target as TTag) != (componentDesc[existenceDescSym].type == EExistence.set)
            ) {
                return false;
            }

            if (
                componentDesc[existenceDescSym].targetType == ETargetType.component
                && entity.hasComponent(componentDesc[existenceDescSym].target as TObjectProto) != (componentDesc[existenceDescSym].type == EExistence.set)
            ) {
                return false;
            }
        }

        return true;
    }
}
