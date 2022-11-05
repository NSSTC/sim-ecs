import type {
    IAccessDescriptor,
    IAccessQuery,
    IComponentsQuery,
    TAccessQueryData,
} from "./query.spec";
import {EQueryType, ETargetType} from "./query.spec";
import {Query} from "./query";
import type {TObjectProto, TTypeProto} from "../_.spec";
import type {IEntity, TTag} from "../entity/entity.spec";
import {accessDescSym, addEntitySym} from "./_";

export class ComponentsQuery<DESC extends IAccessQuery<TObjectProto>> extends Query<DESC, TAccessQueryData<DESC>> implements IComponentsQuery<DESC> {
    constructor(
        protected queryDescriptor: DESC,
    ) {
        super(EQueryType.Components, queryDescriptor);
    }

    [addEntitySym](entity: IEntity): void {
        if (this.matchesEntity(entity)) {
            this.queryResult.set(entity, this.getComponentDataFromEntity(entity, this.queryDescriptor));
        }
    }

    protected getComponentDataFromEntity<K extends keyof DESC>(entity: IEntity, descriptor: DESC): TAccessQueryData<DESC> {
        const components: Record<string, K> = {};
        let accessDesc;
        let componentDesc;

        for (componentDesc of Object.entries(descriptor)) {
            accessDesc = (componentDesc[1] as IAccessDescriptor<K>)[accessDescSym];

            components[componentDesc[0]] = accessDesc.targetType == ETargetType.component
                ? entity.getComponent(accessDesc.target as TTypeProto<K>)!
                : entity as unknown as K;
        }

        return components as unknown as TAccessQueryData<DESC>;
    }

    matchesEntity(entity: IEntity): boolean {
        let componentDesc: IAccessDescriptor<TObjectProto | undefined>;

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
