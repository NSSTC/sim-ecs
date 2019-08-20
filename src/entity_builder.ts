import {Entity} from "./entity";
import IWorld from "./world.spec";
import IEntity from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import IComponent from "./component.spec";

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

    with(component: IComponent | { new(): IComponent }, ...args: any[]): IEntityBuilder {
        this.entity.addComponent(typeof component === 'object'
            ? component
            // @ts-ignore
            : new (component.bind.apply(component, [component].concat(Array.from(arguments).slice(1))))()
        );

        return this;
    }
}
