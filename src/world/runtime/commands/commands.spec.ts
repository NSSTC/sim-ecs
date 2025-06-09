import type {IEntity} from "../../../entity/entity.spec.ts";
import type {TTypeProto} from "../../../_.spec.ts";
import type {TDeserializer, ISerDeOptions} from "../../../serde/serde.spec.ts";
import type {ISerialFormat} from "../../../serde/serial-format.spec.ts";
import type {IWorld, TGroupHandle} from "../../world.spec.ts";
import type {IIStateProto} from "../../../state/state.spec.ts";
import type {ICommandEntityBuilder} from "./command-entity-builder.spec.ts";
import type {IReadOnlyEntity} from "../../../entity/entity.spec.ts";


export type TCommand = () => Promise<void> | void;

/**
 * Commands is an async interface, which aggregates commands for later execution.
 * The primary usage is to issue commands during system runtime and have them take effect on a common sync point,
 * like after all systems ran
 */
export interface ICommands {
    /**
     * Add an entity to the world
     * @param entity
     */
    addEntity(entity: Readonly<IEntity>): void

    /**
     * Add a resource to this world and returns the resource instance
     * @param type
     * @param args constructor parameters
     */
    addResource<T extends object>(type: T | TTypeProto<T>, ...args: ReadonlyArray<unknown>): T

    /**
     * Build an entity and add it to this world using an entity builder
     */
    buildEntity(): ICommandEntityBuilder

    /**
     * Remove all entities from this world
     */
    clearEntities(): void

    /**
     * Load entities with components from a prefab or save
     * @param prefab
     * @param options
     */
    load(prefab: Readonly<ISerialFormat>, options?: Readonly<ISerDeOptions<TDeserializer>>): TGroupHandle

    /**
     * Merge entities from another world into this one
     * @param world
     */
    merge(world: Readonly<IWorld>): TGroupHandle

    /**
     * Provides an environment to securely change an entity's data
     * @param entity
     * @param mutator
     */
    mutateEntity(entity: Readonly<IReadOnlyEntity>, mutator: (entity: IEntity) => any | Promise<any>): void

    /**
     * Revert the running world to a previous state
     */
    popState(): void

    /**
     * Change the running world to a new state
     * @param NewState
     */
    pushState(NewState: IIStateProto): void

    /**
     * Queue custom command for execution
     * @param command
     */
    queueCommand(command: TCommand): void

    /**
     * Remove an entity from the world, deleting all of its components
     * @param entity
     */
    removeEntity(entity: Readonly<IEntity>): void

    /**
     * Remove a group and all entities inside from this world
     * @param handle
     */
    removeGroup(handle: TGroupHandle): void

    /**
     * Remove a resource from the world
     * @param type
     */
    removeResource<T extends object>(type: TTypeProto<T>): void

    /**
     * Replace a resource from this world
     * @param type
     * @param args constructor parameters
     */
    replaceResource<T extends object>(type: T | TTypeProto<T>, ...args: unknown[]): void

    /**
     * Signal the world to stop its dispatch-loop
     */
    stopRun(): void
}
