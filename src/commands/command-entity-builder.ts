import {Entity} from "../entity";
import {ICommandEntityBuilder} from "./command-entity-builder.spec";
import {TObjectProto} from "../_.spec";
import {Commands} from "./commands";

export * from './command-entity-builder.spec';

export class CommandEntityBuilder implements ICommandEntityBuilder {
    protected entity: Entity = new Entity();

    constructor(
        protected commands: Commands
    ) {}

    build(): void {
        this.commands.aggregator.addCommand(() => this.commands.world.addEntity(this.entity));
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
