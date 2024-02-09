import type {
    IEntity,
    IEventMap,
    TAddComponentEventHandler,
    TAddTagEventHandler,
    TCloneEventHandler,
    TEntityId,
    TRemoveComponentEventHandler,
    TRemoveTagEventHandler,
    TTag,
} from "./entity.spec.ts";
import type {TObjectProto, TTypeProto} from "../_.spec.ts";
import {registerEntity} from "../ecs/ecs-entity.ts";
import type {ISerDe} from "../serde/serde.spec.ts";
import {
    SimECSAddComponentEvent,
    SimECSAddTagEvent,
    SimECSCloneEntityEvent,
    SimECSRemoveComponentEvent,
    SimECSRemoveTagEvent
} from "../events/internal-events.ts";

export * from './entity.spec.ts';


let idCounter = BigInt(0);

export class Entity implements IEntity {
    static uuidFn: () => TEntityId = () => `${Date.now()}_${(idCounter++).toString()}`;
    protected components: Map<Readonly<TObjectProto>, /* mut */ object> = new Map();
    protected eventHandlers: { [T in keyof IEventMap]: Set<IEventMap[T]> } = {
        addComponent: new Set<TAddComponentEventHandler>(),
        addTag: new Set<TAddTagEventHandler>(),
        clone: new Set<TCloneEventHandler>(),
        removeComponent: new Set<TRemoveComponentEventHandler>(),
        removeTag: new Set<TRemoveTagEventHandler>(),
    };
    protected tags: Set<TTag> = new Set();
    protected uuid: TEntityId;

    constructor(uuid?: TEntityId) {
        this.uuid = uuid ?? Entity.uuidFn();
        registerEntity(this);
    }

    get id(): TEntityId {
        return this.uuid;
    }

    addComponent(component: Readonly<object> | TObjectProto, ...args: ReadonlyArray<unknown>): Entity {
        const obj = this.asObject(component, ...args);

        if (this.hasComponent(obj.constructor as typeof Object)) {
            throw new Error(`Component "${obj.constructor.name}" already exists on entity!`)
        }

        this.components.set(obj.constructor as TObjectProto, obj);

        {
            const event = new SimECSAddComponentEvent(obj.constructor, obj);
            let handler;
            for (handler of this.eventHandlers.addComponent.values()) {
                handler(event);
            }
        }

        return this;
    }

    addEventListener<T extends keyof IEventMap>(event: T, handler: IEventMap[T]): void {
        switch (event) {
            case "addComponent":
                this.eventHandlers.addComponent.add(handler as TAddComponentEventHandler);
                break;
            case "addTag":
                this.eventHandlers.addTag.add(handler as TAddTagEventHandler);
                break;
            case "clone":
                this.eventHandlers.clone.add(handler as TCloneEventHandler);
                break;
            case "removeComponent":
                this.eventHandlers.removeComponent.add(handler as TRemoveComponentEventHandler);
                break;
            case "removeTag":
                this.eventHandlers.removeTag.add(handler as TRemoveTagEventHandler);
                break;
        }
    }

    addTag(tag: TTag): Entity {
        this.tags.add(tag);

        {
            const event = new SimECSAddTagEvent(tag);
            let handler ;
            for (handler of this.eventHandlers.addTag.values()) {
                handler(event);
            }
        }

        return this;
    }

    protected asObject(component: Readonly<object> | TObjectProto, ...args: ReadonlyArray<unknown>): object {
        return typeof component === 'object'
            ? component
            : new (component.prototype.constructor.bind(component, ...args))();
    }

    clone(serde: ISerDe, uuid?: TEntityId): Entity {
        // serialize
        const serialFormat = serde.serialize({
            entities: [this].values(),
            resources: {},
        });

        // de-serialize
        const entity: Entity = serde.deserialize(serialFormat).entities.next().value;

        // assign new ID
        entity.uuid = uuid ?? Entity.uuidFn();

        { // send out event
            const event = new SimECSCloneEntityEvent(this, entity);
            let handler;
            for (handler of this.eventHandlers.clone.values()) {
                handler(event);
            }
        }

        // DONE!
        return entity;
    }

    getComponent<T extends object>(component: TTypeProto<T>): T | undefined {
        return this.components.get(component) as T;
    }

    getComponentCount(): number {
        return this.components.size;
    }

    getComponents(): IterableIterator<object> {
        return this.components.values();
    }

    protected getConstructor(component: Readonly<object> | TObjectProto): Readonly<TObjectProto> {
        return this.isConstructor(component)
            ? component as TObjectProto
            : component.constructor;
    }

    getTagCount(): number {
        return this.tags.size;
    }

    getTags(): IterableIterator<TTag> {
        return this.tags.values();
    }

    hasComponent(component: typeof Object | TObjectProto): boolean {
        return this.components.has(this.getConstructor(component));
    }

    hasEventListener<T extends keyof IEventMap>(event: T, handler: IEventMap[T]): boolean {
        switch (event) {
            case "addComponent":
                return this.eventHandlers.addComponent.has(handler as TAddComponentEventHandler);
            case "addTag":
                return this.eventHandlers.addTag.has(handler as TAddTagEventHandler);
            case "clone":
                return this.eventHandlers.clone.has(handler as TCloneEventHandler);
            case "removeComponent":
                return this.eventHandlers.removeComponent.has(handler as TRemoveComponentEventHandler);
            case "removeTag":
                return this.eventHandlers.removeTag.has(handler as TRemoveTagEventHandler);
            default:
                return false;
        }
    }

    hasTag(tag: TTag): boolean {
        return this.tags.has(tag);
    }

    protected isConstructor(component: Readonly<object> | TObjectProto): boolean {
        return typeof component !== 'object';
    }

    removeComponent(component: Readonly<object> | TObjectProto): Entity {
        const componentConstructor = this.getConstructor(component);

        if (!this.components.has(componentConstructor)) {
            return this;
        }

        const componentInstance = this.isConstructor(component)
            ? this.components.get(component as TObjectProto)!
            : component;

        this.components.delete(componentConstructor);

        {
            const event = new SimECSRemoveComponentEvent(componentConstructor, componentInstance);
            let handler;
            for (handler of this.eventHandlers.removeComponent.values()) {
                handler(event);
            }
        }

        return this;
    }

    removeEventListener<T extends keyof IEventMap>(event: T, handler: IEventMap[T]): void {
        switch (event) {
            case "addComponent":
                this.eventHandlers.addComponent.delete(handler as TAddComponentEventHandler);
                break;
            case "addTag":
                this.eventHandlers.addTag.delete(handler as TAddTagEventHandler);
                break;
            case "clone":
                this.eventHandlers.clone.delete(handler as TCloneEventHandler);
                break;
            case "removeComponent":
                this.eventHandlers.removeComponent.delete(handler as TRemoveComponentEventHandler);
                break;
            case "removeTag":
                this.eventHandlers.removeTag.delete(handler as TRemoveTagEventHandler);
                break;
        }
    }

    removeTag(tag: TTag): Entity {
        this.tags.delete(tag);

        {
            const event = new SimECSRemoveTagEvent(tag);
            let handler;
            for (handler of this.eventHandlers.removeTag.values()) {
                handler(event);
            }
        }

        return this;
    }
}
