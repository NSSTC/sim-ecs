import type {IEntitiesQuery, TExistenceQuery} from "./query.spec.ts";
import {EExistence, EQueryType, ETargetType} from "./query.spec.ts";
import {Query} from "./query.ts";
import type {IEntity, TTag} from "../entity/entity.spec.ts";
import {addEntitySym, entitySym, existenceDescSym} from "./_.ts";
import type {TObjectProto} from "../_.spec.ts";

export class EntitiesQuery extends Query<TExistenceQuery<TObjectProto>, IEntity> implements IEntitiesQuery {
    constructor(
        protected queryDesc: Readonly<TExistenceQuery<TObjectProto>>
    ) {
        super(EQueryType.Entities, queryDesc);
    }

    [addEntitySym](entity: Readonly<IEntity>): void {
        if (this.matchesEntity(entity)) {
            this.isSortDirty = true;
            this.queryResult.push({ [entitySym]: entity, ...entity });
        }
    }

    matchesEntity(entity: Readonly<IEntity>): boolean {
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
