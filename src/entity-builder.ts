import {Entity} from "./entity";
import IEntityBuilder from "./entity-builder.spec";
import {TObjectProto} from "./_.spec";

export * from './entity-builder.spec';

export class EntityBuilder implements IEntityBuilder {
    protected entity = new Entity();

    build(): Entity {
        return this.entity;
    }

    with(component: Object | TObjectProto, ...args: unknown[]): EntityBuilder {
        this.entity.addComponent(this.asComponent(component));
        return this;
    }

    withAll(...components: (Object | TObjectProto)[]): EntityBuilder {
        let component;

        for (component of components) {
            this.with(component);
        }

        return this;
    }

    protected asComponent(component: Object | TObjectProto, ...args: unknown[]): Object {
        return typeof component === 'object'
            ? component
            : new (component.prototype.constructor.bind(component, ...Array.from(arguments).slice(1)))();
    }
}
