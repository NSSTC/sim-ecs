import {Entity} from "../../../entity/entity";
import type {ICommandEntityBuilder} from "./command-entity-builder.spec";
import type {TObjectProto} from "../../../_.spec";
import type {IWorld} from "../../world.spec";
import {ICommands} from "./commands.spec";

export * from './command-entity-builder.spec';

export class CommandEntityBuilder implements ICommandEntityBuilder {
    protected entity: Entity = new Entity();

    constructor(
        protected world: Readonly<IWorld>,
        protected commands: Readonly<ICommands>,
    ) {}

    build(): void {
        this.commands.addEntity(this.entity);
    }

    with(component: object | TObjectProto, ...args: ReadonlyArray<unknown>): CommandEntityBuilder {
        this.entity.addComponent(component, ...args);
        return this;
    }

    withAll(...components: ReadonlyArray<object | TObjectProto>): CommandEntityBuilder {
        let component;

        for (component of components) {
            this.with(component);
        }

        return this;
    }
}
