import {Entity, type TEntityId} from "./entity.ts";
import type {IEntityBuilder} from "./entity-builder.spec.ts";
import type {TObjectProto} from "../_.spec.ts";

export * from './entity-builder.spec.ts';

export class EntityBuilder implements IEntityBuilder {
    protected components = new Map<Readonly<object | TObjectProto>, ReadonlyArray<unknown>>();

    constructor(
        protected uuid?: TEntityId,
        protected callback?: (entity: Entity) => void,
    ) {}

    build(): Entity {
        const entity = new Entity(this.uuid);
        let component;

        for (component of this.components) {
            entity.addComponent(component[0], ...component[1]);
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
}
