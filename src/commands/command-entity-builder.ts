import {Entity} from "../entity";
import {ICommandEntityBuilder} from "./command-entity-builder.spec";
import {TObjectProto} from "../_.spec";
import {ICommandsAggregator} from "./commands-aggregator.spec";
import IWorld from "../world.spec";

export * from './command-entity-builder.spec';

export class CommandEntityBuilder implements ICommandEntityBuilder {
    protected entity: Entity = new Entity();

    constructor(
        protected world: IWorld,
        protected commandsAggregator: ICommandsAggregator,
    ) {}

    build(): void {
        this.commandsAggregator.addCommand(() => this.world.addEntity(this.entity));
    }

    with(component: Object | TObjectProto, ...args: unknown[]): CommandEntityBuilder {
        this.entity.addComponent(this.asComponent(component));
        return this;
    }

    withAll(...components: (Object | TObjectProto)[]): CommandEntityBuilder {
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
