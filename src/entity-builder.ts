import {Entity} from "./entity";
import IEntityBuilder from "./entity-builder.spec";
import {TObjectProto} from "./_.spec";

export * from './entity-builder.spec';

export class EntityBuilder implements IEntityBuilder {
    protected entity: Entity;

    constructor(
        uuid?: string,
        protected callback?: (entity: Entity) => void
    ) {
        this.entity = new Entity(uuid);
    }

    build(): Entity {
        this.callback?.(this.entity);
        return this.entity;
    }

    with(component: Object | TObjectProto, ...args: unknown[]): EntityBuilder {
        this.entity.addComponent(component);
        return this;
    }

    withAll(...components: (Object | TObjectProto)[]): EntityBuilder {
        let component;

        for (component of components) {
            this.with(component);
        }

        return this;
    }
}
