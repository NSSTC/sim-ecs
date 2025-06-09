import type {ICommands} from "./commands.spec.ts";
import type {IEntity, IReadOnlyEntity} from "../../../entity/entity.spec.ts";
import type {TTypeProto} from "../../../_.spec.ts";
import type {TDeserializer, ISerDeOptions} from "../../../serde/serde.spec.ts";
import type {ISerialFormat} from "../../../serde/serial-format.spec.ts";
import type {TGroupHandle} from "../../world.spec.ts";
import type {IIStateProto} from "../../../state/state.spec.ts";
import type {TCommand} from "./commands-aggregator.spec.ts";
import {CommandEntityBuilder} from "./command-entity-builder.ts";
import {RuntimeWorld} from "../runtime-world.ts";
import type {IPreptimeWorld} from "../../preptime/preptime-world.spec.ts";
import type {IQuery} from "../../../query/query.spec.ts";
import {addEntitySym} from "../../../query/_.ts";
import {Entity} from "../../../entity/entity.ts";
import {SimECSMutateEntityEvent} from "../../../events/internal-events.ts";

export * from "./commands.spec.ts";

export class Commands implements ICommands {
    protected commands: Array<TCommand> = [];

    constructor(
        protected readonly world: RuntimeWorld,
        protected readonly queries: ReadonlySet<Readonly<IQuery<unknown, unknown>>>,
    ) {}

    addEntity(entity: Readonly<IEntity>): void {
        this.commands.push(() => {
            this.world.addEntity(entity);

            let query;
            for (query of this.queries) {
                query[addEntitySym](entity);
            }
        });
    }

    addResource<T extends object>(obj: TTypeProto<T> | T, ...args: ReadonlyArray<unknown>): T {
        let type: TTypeProto<T>;
        let instance: T;

        if (typeof obj === 'object') {
            type = obj.constructor as TTypeProto<T>;
            instance = obj;
        } else {
            type = obj;
            instance = new (obj.prototype.constructor.bind(obj, ...args))();
        }

        if (this.world.data.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" already exists!`);
        }

        this.commands.push(() => {
            if (this.world.data.resources.has(type)) {
                throw new Error(`Resource with name "${type.name}" already exists!`);
            }

            this.world.data.resources.set(type, instance);
        });

        return instance;
    }

    buildEntity(): CommandEntityBuilder {
        return new CommandEntityBuilder(this.world, this);
    }

    clearEntities(): void {
        this.commands.push(() => { this.world.data.entities.clear() });
    }

    async executeAll(): Promise<void> {
        if (this.commands.length > 0) {
            for (let command = this.commands.shift(); !!command; command = this.commands.shift()) {
                await command();
            }
        }
    }

    load(prefab: Readonly<ISerialFormat>, options?: Readonly<ISerDeOptions<TDeserializer>>): TGroupHandle {
        const handle = this.world.createGroup();
        this.commands.push(() => {
            this.world.load(prefab, options, handle);

            let entity, query;
            for (entity of this.world.getGroupEntities(handle)) {
                for (query of this.queries) {
                    query[addEntitySym](entity);
                }
            }
        });
        return handle;
    }

    merge(world: Readonly<IPreptimeWorld>): TGroupHandle {
        const handle = this.world.createGroup();
        this.commands.push(() => { this.world.merge(world, handle) });
        return handle;
    }

    mutateEntity(entity: Readonly<IReadOnlyEntity>, mutator: (entity: IEntity) => Promise<any> | any): void {
        if (!(entity instanceof Entity)) {
            throw new Error(`The entity "${entity.id}" cannot be mutated!`);
        }

        this.commands.push(async () => {
            mutator(entity);
            this.world.refreshEntityQueryRegistration(entity);
            await this.world.eventBus.publish(new SimECSMutateEntityEvent(entity));
        });
    }

    popState(): void {
        this.commands.push(() => this.world.popState());
    }

    pushState(NewState: IIStateProto): void {
        this.commands.push(() => this.world.pushState(NewState));
    }

    queueCommand(command: TCommand) {
        this.commands.push(command);
    }

    removeEntity(entity: Readonly<IEntity>): void {
        this.commands.push(() => this.world.removeEntity(entity));
    }

    removeGroup(handle: TGroupHandle): void {
        this.commands.push(() => this.world.removeGroup(handle));
    }

    removeResource<T extends object>(type: TTypeProto<T>): void {
        if (!this.world.data.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" does not exists!`);
        }

        this.commands.push(() => {
            if (!this.world.data.resources.has(type)) {
                throw new Error(`Resource with name "${type.name}" does not exists!`);
            }

            this.world.data.resources.delete(type);
        });
    }

    replaceResource<T extends object>(obj: TTypeProto<T> | T, ...args: ReadonlyArray<unknown>): void {
        let type: TTypeProto<T>;

        if (typeof obj === 'object') {
            type = obj.constructor as TTypeProto<T>;
        } else {
            type = obj;
        }

        if (!this.world.data.resources.has(type)) {
            throw new Error(`Resource with name "${type.name}" does not exists!`);
        }

        this.commands.push(() => {
            if (!this.world.data.resources.has(type)) {
                throw new Error(`Resource with name "${type.name}" does not exists!`);
            }

            this.world.data.resources.delete(type);
            this.world.addResource(obj, ...args);
        });
    }

    stopRun(): void {
        this.commands.push(() => this.world.stop());
    }
}
