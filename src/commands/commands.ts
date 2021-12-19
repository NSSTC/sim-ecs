import {ICommands} from "./commands.spec";
import {IEntity} from "../entity.spec";
import {TTypeProto} from "../_.spec";
import {ISerialFormat} from "../serde/serial-format.spec";
import {TDeserializer, TSerDeOptions} from "../serde/serde.spec";
import IWorld, {TGroupHandle} from "../world.spec";
import {IIStateProto} from "../state.spec";
import {World} from "../world";
import {ICommandsAggregator, TCommand} from "./commands-aggregator.spec";
import {CommandEntityBuilder} from "./command-entity-builder";

export * from "./commands.spec";

export class Commands implements ICommands {
    constructor(
        public readonly world: World,
        public readonly aggregator: ICommandsAggregator,
    ) {}

    addEntity(entity: IEntity) {
        this.aggregator.addCommand(() => this.world.addEntity(entity));
    }

    addResource<T extends Object>(obj: TTypeProto<T> | T, ...args: unknown[]): T {
        let type: TTypeProto<T>;
        let instance: T;

        if (typeof obj === 'object') {
            type = obj.constructor as TTypeProto<T>;
            instance = obj;
        } else {
            type = obj;
            instance = new (obj.prototype.constructor.bind(obj, ...Array.from(arguments).slice(1)))();
        }

        if (this.world.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" already exists!`);
        }

        this.aggregator.addCommand(() => {
            if (this.world.resources.has(type)) {
                throw new Error(`Resource with name "${type.name}" already exists!`);
            }

            this.world.resources.set(type, instance);
        });

        return instance;
    }

    buildEntity(): CommandEntityBuilder {
        return new CommandEntityBuilder(this);
    }

    clearEntities(): void {
        this.aggregator.addCommand(() => this.world.entities.clear());
    }

    load(prefab: ISerialFormat, options?: TSerDeOptions<TDeserializer>): TGroupHandle {
        const handle = this.world.createGroup();
        this.aggregator.addCommand(() => { this.world.load(prefab, options, handle) });
        return handle;
    }

    maintain() {
        this.aggregator.triggerMaintain();
    }

    merge(world: IWorld): TGroupHandle {
        const handle = this.world.createGroup();
        this.aggregator.addCommand(() => { this.world.merge(world, handle) });
        return handle;
    }

    popState(): void {
        this.aggregator.addCommand(() => this.world.popState());
    }

    pushState(NewState: IIStateProto): void {
        this.aggregator.addCommand(() => this.world.pushState(NewState));
    }

    queueCommand(command: TCommand) {
        this.aggregator.addCommand(command);
    }

    removeEntity(entity: IEntity): void {
        this.aggregator.addCommand(() => this.world.removeEntity(entity));
    }

    removeGroup(handle: TGroupHandle): void {
        this.aggregator.addCommand(() => this.world.removeGroup(handle));
    }

    removeResource<T extends Object>(type: TTypeProto<T>): void {
        if (!this.world.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" does not exists!`);
        }

        this.aggregator.addCommand(() => {
            if (!this.world.resources.has(type)) {
                throw new Error(`Resource with name "${type.name}" does not exists!`);
            }

            this.world.resources.delete(type);
        });
    }

    replaceResource<T extends Object>(obj: TTypeProto<T> | T, ...args: unknown[]): void {
        let type: TTypeProto<T>;

        if (typeof obj === 'object') {
            type = obj.constructor as TTypeProto<T>;
        } else {
            type = obj;
        }

        if (!this.world.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" does not exists!`);
        }

        this.aggregator.addCommand(() => {
            if (!this.world.resources.has(type)) {
                throw new Error(`Resource with name "${type.name}" does not exists!`);
            }

            this.world.resources.delete(type);
            this.world.addResource(obj, ...args);
        });
    }

    stopRun(): void {
        this.aggregator.addCommand(() => this.world.stopRun());
    }
}
