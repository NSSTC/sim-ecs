import {Entity} from "../entity";
import type {ICommandEntityBuilder} from "./command-entity-builder.spec";
import type {TObjectProto} from "../_.spec";
import type {ICommandsAggregator} from "./commands-aggregator.spec";
import type {IWorld} from "../world.spec";

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
        this.entity.addComponent(component, ...args);
        return this;
    }

    withAll(...components: (Object | TObjectProto)[]): CommandEntityBuilder {
        let component;

        for (component of components) {
            this.with(component);
        }

        return this;
    }
}
