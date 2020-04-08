import {Entity} from "./entity";
import IWorld from "./world.spec";
import IEntity from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import {TObjectProto} from "./_.spec";

export * from './entity_builder.spec';

export class EntityBuilder implements IEntityBuilder {
    protected entity: IEntity;
    protected world: IWorld;

    constructor(world: IWorld) {
        this.entity = new Entity();
        this.world = world;
    }

    build(): IEntity {
        this.world.addEntity(this.entity);
        return this.entity;
    }

    with(component: Object | TObjectProto, ...args: any[]): IEntityBuilder {
        this.entity.addComponent(this.asComponent(component));
        return this;
    }

    withQuick(component: Object | TObjectProto, ...args: any[]): IEntityBuilder {
        this.entity.addComponentQuick(this.asComponent(component));
        return this;
    }

    protected asComponent(component: Object | TObjectProto, ...args: any[]): Object {
        return typeof component === 'object'
            ? component
            // @ts-ignore
            : new (component.bind.apply(component, [component].concat(Array.from(arguments).slice(1))))();
    }
}
