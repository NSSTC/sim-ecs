import {Entity} from "./entity";
import {IPartialWorld} from "./world.spec";
import IEntity from "./entity.spec";
import IEntityBuilder from "./entity-builder.spec";
import {TObjectProto} from "./_.spec";

export * from './entity-builder.spec';

export class EntityBuilder implements IEntityBuilder {
    protected entity: IEntity;
    protected world: IPartialWorld;

    constructor(world: IPartialWorld) {
        this.entity = new Entity();
        this.world = world;
    }

    build(): IEntity {
        this.world.addEntity(this.entity);
        return this.entity;
    }

    with(component: Object | TObjectProto, ...args: unknown[]): IEntityBuilder {
        this.entity.addComponent(this.asComponent(component));
        return this;
    }

    protected asComponent(component: Object | TObjectProto, ...args: unknown[]): Object {
        return typeof component === 'object'
            ? component
            : new (component.prototype.constructor.bind(component, ...Array.from(arguments).slice(1)))();
    }
}
