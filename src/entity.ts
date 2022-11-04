import type {IEntity, TEntityId, TTag} from "./entity.spec";
import type {TObjectProto, TTypeProto} from "./_.spec";
import {registerEntity} from "./ecs/ecs-entity";

export * from './entity.spec';

let idCounter = BigInt(0);

export class Entity implements IEntity {
    static uuidFn: () => TEntityId = () => `${Date.now()}_${(idCounter++).toString()}`;
    protected components: Map<TObjectProto, Object> = new Map();
    public readonly id: TEntityId;
    protected tags: Set<TTag> = new Set();

    constructor(uuid?: TEntityId) {
        this.id = uuid
            ? uuid
            : Entity.uuidFn();

        registerEntity(this);
    }

    addComponent(component: Object | TObjectProto, ...args: unknown[]): Entity {
        const obj = this.asObject(component, ...args);

        if (this.hasComponent(obj.constructor as typeof Object)) {
            throw new Error(`Component "${obj.constructor.name}" already exists on entity!`)
        }

        this.components.set(obj.constructor as TObjectProto, obj);
        return this;
    }

    addTag(tag: TTag): Entity {
        this.tags.add(tag);
        return this;
    }

    protected asObject(component: Object | TObjectProto, ...args: unknown[]): Object {
        return typeof component === 'object'
            ? component
            : new (component.prototype.constructor.bind(component, ...Array.from(arguments).slice(1)))();
    }

    getComponent<T extends Object>(component: TTypeProto<T>): T | undefined {
        return this.components.get(component) as T;
    }

    getComponents(): IterableIterator<Object> {
        return this.components.values();
    }

    protected getConstructor(component: Object | TObjectProto): TObjectProto {
        return typeof component === 'object'
            ? component.constructor as TObjectProto
            : component;
    }

    getTags(): IterableIterator<TTag> {
        return this.tags.values();
    }

    hasComponent(component: typeof Object | TObjectProto): boolean {
        return this.components.has(component);
    }

    hasTag(tag: TTag): boolean {
        return this.tags.has(tag);
    }

    removeComponent(component: Object | TObjectProto): Entity {
        this.components.delete(this.getConstructor(component));
        return this;
    }

    removeTag(tag: TTag): Entity {
        this.tags.delete(tag);
        return this;
    }
}
