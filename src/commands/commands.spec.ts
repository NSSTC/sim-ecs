import {IEntity} from "../entity.spec";
import {TTypeProto} from "../_.spec";
import {ISerialFormat} from "../serde/serial-format.spec";
import {TDeserializer, TSerDeOptions} from "../serde/serde.spec";
import {IWorld, TGroupHandle} from "../world.spec";
import {TStateProto} from "../state.spec";
import {ICommandEntityBuilder} from "./command-entity-builder.spec";
import {TCommand} from "./commands-aggregator.spec";


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
    addEntity(entity: IEntity): void

    /**
     * Add a resource to this world and returns the resource instance
     * @param type
     * @param args constructor parameters
     */
    addResource<T extends Object>(type: T | TTypeProto<T>, ...args: unknown[]): T

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
    load(prefab: ISerialFormat, options?: TSerDeOptions<TDeserializer>): TGroupHandle

    /**
     * Also trigger a maintain on the next execution
     */
    maintain(): void

    /**
     * Merge entities from another world into this one
     * @param world
     */
    merge(world: IWorld): TGroupHandle

    /**
     * Revert the running world to a previous state
     */
    popState(): void

    /**
     * Change the running world to a new state
     * @param NewState
     */
    pushState(NewState: TStateProto): void

    /**
     * Queue custom command for execution
     * @param command
     */
    queueCommand(command: TCommand): void

    /**
     * Remove an entity from the world, deleting all of its components
     * @param entity
     */
    removeEntity(entity: IEntity): void

    /**
     * Remove a resource from the world
     * @param type
     */
    removeResource<T extends Object>(type: TTypeProto<T>): void

    /**
     * Replace a resource from this world
     * @param type
     * @param args constructor parameters
     */
    replaceResource<T extends Object>(type: T | TTypeProto<T>, ...args: unknown[]): void

    /**
     * Signal the world to stop its dispatch-loop
     */
    stopRun(): void

    /**
     * Remove entities with data-components from a prefab file
     * @param handle
     */
    unloadPrefab(handle: TGroupHandle): void
}
