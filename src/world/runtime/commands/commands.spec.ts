import type {IEntity} from "../../../entity/entity.spec";
import type {TTypeProto} from "../../../_.spec";
import type {TDeserializer, ISerDeOptions} from "../../../serde/serde.spec";
import type {ISerialFormat} from "../../../serde/serial-format.spec";
import type {IWorld, TGroupHandle} from "../../world.spec";
import type {IIStateProto} from "../../../state/state.spec";
import type {ICommandEntityBuilder} from "./command-entity-builder.spec";


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
    load(prefab: ISerialFormat, options?: ISerDeOptions<TDeserializer>): TGroupHandle

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
    removeEntity(entity: IEntity): void

    /**
     * Remove a group and all entities inside from this world
     * @param handle
     */
    removeGroup(handle: TGroupHandle): void

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
}
