import {Entity, type TEntityId} from "./entity";
import type {IEntityBuilder} from "./entity-builder.spec";
import type {TObjectProto} from "../_.spec";

export * from './entity-builder.spec';

export class EntityBuilder implements IEntityBuilder {
    protected components = new Map<object | TObjectProto, unknown[]>();

    constructor(
        protected uuid?: TEntityId,
        protected callback?: (entity: Entity) => void
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

    with(component: object | TObjectProto, ...args: unknown[]): EntityBuilder {
        this.components.set(component, args);
        return this;
    }

    withAll(...components: (object | TObjectProto)[]): EntityBuilder {
        let component;
        for (component of components) {
            this.with(component);
        }

        return this;
    }
}
