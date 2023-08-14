import {Entity} from "../../../entity/entity.ts";
import type {ICommandEntityBuilder} from "./command-entity-builder.spec.ts";
import type {TObjectProto} from "../../../_.spec.ts";
import type {IWorld} from "../../world.spec.ts";
import type {ICommands} from "./commands.spec.ts";

export * from './command-entity-builder.spec.ts';

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
