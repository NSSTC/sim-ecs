import {
    IAccessDescriptor,
    IAccessQuery,
    IComponentsQuery,
    IExistenceDescriptor,
    TAccessQueryData,
    TAccessQueryParameter,
} from "./query.spec.ts";
import {EExistence, EQueryType, ETargetType} from "./query.spec.ts";
import {Query} from "./query.ts";
import type {TObjectProto} from "../_.spec.ts";
import type {IEntity, TTag} from "../entity/entity.spec.ts";
import {accessDescSym, addEntitySym, entitySym, existenceDescSym} from "./_.ts";

export class ComponentsQuery<DESC extends IAccessQuery<TObjectProto>> extends Query<DESC, TAccessQueryData<DESC>> implements IComponentsQuery<DESC> {
    constructor(
        protected queryDescriptor: Readonly<DESC>,
    ) {
        super(EQueryType.Components, queryDescriptor);
    }

    [addEntitySym](entity: Readonly<IEntity>): void {
        if (this.matchesEntity(entity)) {
            this.isSortDirty = true;
            this.queryResult.push({
                [entitySym]: entity,
                ...this.getComponentDataFromEntity(entity, this.queryDescriptor),
            });
        }
    }

    protected getComponentDataFromEntity(entity: Readonly<IEntity>, descriptor: Readonly<DESC>): TAccessQueryData<DESC> {
        const components: Record<string, Readonly<object>> = {};
        let accessDesc;
        let componentDesc: Readonly<TObjectProto | TAccessQueryParameter<TObjectProto>>;
        let componentName: string;

        for ([componentName, componentDesc] of Object.entries(descriptor)) {
            accessDesc = (componentDesc as IAccessDescriptor<object>)[accessDescSym];

            if (accessDesc === undefined) {
                continue;
            }

            components[componentName] = accessDesc.targetType == ETargetType.component
                ? (entity.getComponent(accessDesc.target as TObjectProto) ?? entity)
                : entity;
        }

        return components as TAccessQueryData<DESC>;
    }

    matchesEntity(entity: Readonly<IEntity>): boolean {
        let componentDesc: Readonly<IAccessDescriptor<TObjectProto | undefined>>;
        let existenceDesc;

        // @ts-ignore todo: figure out typing. Something is still wrong somewhere
        for (componentDesc of Object.values(this.queryDescriptor)) {
            existenceDesc = (componentDesc as Partial<IExistenceDescriptor<TObjectProto>>)[existenceDescSym];

            if (existenceDesc !== undefined) {
                const exists = existenceDesc.targetType == ETargetType.tag
                    ? entity.hasTag(existenceDesc.target as TTag)
                    : entity.hasComponent(existenceDesc.target as TObjectProto);

                if (exists != (existenceDesc.type == EExistence.set)) {
                    return false;
                }

                continue;
            }

            if (
                componentDesc[accessDescSym].targetType == ETargetType.tag
                && !entity.hasTag(componentDesc[accessDescSym].target as TTag)
            ) {
                return false;
            }

            if (
                componentDesc[accessDescSym].targetType == ETargetType.component
                && !entity.hasComponent(componentDesc[accessDescSym].target as TObjectProto)
            ) {
                if (componentDesc[accessDescSym].optional) {
                    continue;
                }

                return false;
            }

            if (
                componentDesc[accessDescSym].targetType == ETargetType.entity
                && componentDesc[accessDescSym].data !== undefined
                && componentDesc[accessDescSym].data != entity.id
            ) {
                return false;
            }
        }

        return true;
    }
}
