import type {TObjectProto, TTypeProto} from "../_.spec.ts";
import type {ISerDe} from "../serde/serde.spec.ts";
import type {SimECSAddComponentEvent} from "../events/internal-events.ts";
import type {
    SimECSAddTagEvent,
    SimECSCloneEntityEvent,
    SimECSRemoveComponentEvent,
    SimECSRemoveTagEvent
} from "../events/internal-events.ts";


export type TEntityId = string;
export type TTag = number | string;

export type TAddComponentEventHandler = (event: SimECSAddComponentEvent) => void;
export type TAddTagEventHandler = (event: SimECSAddTagEvent) => void;
export type TCloneEventHandler = (event: SimECSCloneEntityEvent) => void;
export type TRemoveComponentEventHandler = (event: SimECSRemoveComponentEvent) => void;
export type TRemoveTagEventHandler = (event: SimECSRemoveTagEvent) => void;


export interface IEventMap {
    addComponent: TAddComponentEventHandler,
    addTag: TAddTagEventHandler,
    clone: TCloneEventHandler,
    removeComponent: TRemoveComponentEventHandler,
    removeTag: TRemoveTagEventHandler,
}

export interface IReadOnlyEntity {
    /**
     * UUID to identify the entity across instances
     * The ID is generated and must be manually maintained when syncing with another instance
     */
    readonly id: TEntityId

    /**
     * Add event listener
     * @param event
     * @param handler
     */
    addEventListener<T extends keyof IEventMap>(event: T, handler: IEventMap[T]): void

    /**
     * Clone this entity with all of its components and tags.
     * This is done by serializing and de-serializing the entity
     * @param serde SerDe to use for serialization
     * @param uuid UUID of new component
     */
    clone(serde: ISerDe, uuid?: TEntityId): IEntity

    /**
     * Get a component of a certain type which is associated with this entity
     * @param component
     */
    getComponent<T extends object>(component: TTypeProto<T>): T | undefined

    /**
     * Get number of components associated with this entity
     */
    getComponentCount(): number

    /**
     * Get all components
     */
    getComponents(): IterableIterator<object>

    /**
     * Get number of tags associated with this entity
     */
    getTagCount(): number

    /**
     * Get all tags
     */
    getTags(): IterableIterator<TTag>

    /**
     * Check if a certain component is associated with this entity
     * @param component
     */
    hasComponent(component: typeof Object | TObjectProto): boolean

    /**
     * Check if an event listener already exists on the entity
     * Mostly intersting for testing the lib
     * @param event
     * @param handler
     */
    hasEventListener<T extends keyof IEventMap>(event: T, handler: IEventMap[T]): void

    /**
     * Check if this entity has a given tag
     * @param tag
     */
    hasTag(tag: TTag): boolean

    /**
     * Remove a listener
     * @param event
     * @param handler
     */
    removeEventListener<T extends keyof IEventMap>(event: T, handler: IEventMap[T]): void
}

export interface IEntity extends IReadOnlyEntity {
    /**
     * Add a component to this entity
     * @param component
     * @param args
     */
    addComponent(component: Readonly<object> | TObjectProto, ...args: ReadonlyArray<unknown>): IEntity

    /**
     * Add a tag to this entity
     * Tagging can be used to mark the entity instead of using an empty marker-component
     * Tags cannot be queried for! They are only markers
     * and should be implemented and used as lean and light-weight as possible.
     * @param tag
     */
    addTag(tag: TTag): IEntity

    /**
     * Un-associate a component from this entity
     * @param component
     */
    removeComponent(component: Readonly<object> | TObjectProto): IEntity

    /**
     * Remove a tag from this entity
     * @param tag
     */
    removeTag(tag: TTag): IEntity
}

export type TEntityProto = { new(): IEntity };
