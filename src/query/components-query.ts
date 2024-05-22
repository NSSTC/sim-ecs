import {
    IAccessDescriptor,
    IAccessQuery,
    IComponentsQuery,
    TAccessQueryData,
    TAccessQueryParameter,
} from "./query.spec.ts";
import {EQueryType, ETargetType} from "./query.spec.ts";
import {Query} from "./query.ts";
import type {TObjectProto} from "../_.spec.ts";
import type {IEntity, TTag} from "../entity/entity.spec.ts";
import {accessDescSym, addEntitySym, entitySym} from "./_.ts";

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

    protected getComponentDataFromEntity(entity: Readonly<IEntity>, descriptor: Readonly<DESC>): Readonly<TAccessQueryData<DESC>> {
        const components: Record<string, Readonly<object>> = {};
        let accessDesc;
        let componentDesc: Readonly<TObjectProto | TAccessQueryParameter<TObjectProto>>;
        let componentName: string;

        for ([componentName, componentDesc] of Object.entries(descriptor)) {
            accessDesc = (componentDesc as IAccessDescriptor<object>)[accessDescSym];

            components[componentName] = accessDesc.targetType == ETargetType.component
                ? (entity.getComponent(accessDesc.target as TObjectProto) ?? entity)
                : entity;
        }

        return components as TAccessQueryData<DESC>;
    }

    matchesEntity(entity: Readonly<IEntity>): boolean {
        let componentDesc: Readonly<IAccessDescriptor<TObjectProto | undefined>>;

        // @ts-ignore todo: figure out typing. Something is still wrong somewhere
        for (componentDesc of Object.values(this.queryDescriptor)) {
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
