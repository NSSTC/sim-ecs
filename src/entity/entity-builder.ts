import {Entity, type TEntityId} from "./entity.ts";
import type {TTag} from "./entity.spec.ts";
import type {IEntityBuilder} from "./entity-builder.spec.ts";
import type {TObjectProto} from "../_.spec.ts";

export * from './entity-builder.spec.ts';

export class EntityBuilder implements IEntityBuilder {
    protected components = new Map<Readonly<object | TObjectProto>, ReadonlyArray<unknown>>();
    protected tags = new Set<TTag>();

    constructor(
        protected uuid?: TEntityId,
        protected callback?: (entity: Entity) => void,
    ) {}

    build(): Entity {
        const entity = new Entity(this.uuid);
        let component;
        let tag;

        for (component of this.components) {
            entity.addComponent(component[0], ...component[1]);
        }

        for (tag of this.tags) {
            entity.addTag(tag);
        }

        this.callback?.(entity);
        return entity;
    }

    with(component: Readonly<object | TObjectProto>, ...args: ReadonlyArray<unknown>): EntityBuilder {
        this.components.set(component, args);
        return this;
    }

    withAll(...components: ReadonlyArray<object | TObjectProto>): EntityBuilder {
        let component;
        for (component of components) {
            this.with(component);
        }

        return this;
    }

    withTag(tag: TTag): EntityBuilder {
        this.tags.add(tag);
        return this;
    }

    withTags(...tags: ReadonlyArray<TTag>): EntityBuilder {
        let tag;
        for (tag of tags) {
            this.withTag(tag);
        }

        return this;
    }
}
