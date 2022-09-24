import {IEntity, TTag} from "./entity.spec";
import {TObjectProto, TTypeProto} from "./_.spec";
import {registerEntity, unregisterEntity} from "./ecs/ecs-entity";

export * from './entity.spec';

export class Entity implements IEntity {
    static uuidFn?: () => string;
    protected components: Map<TObjectProto, Object> = new Map();
    protected tags: Set<TTag> = new Set();

    constructor(protected uuid?: string) {
        if (uuid) {
            registerEntity(this);
        }
    }

    get id() {
        if (!this.uuid && Entity.uuidFn) {
            this.uuid = Entity.uuidFn();
            registerEntity(this);
        }

        return this.uuid;
    }

    addComponent(component: Object | TObjectProto): Entity {
        const obj = this.asObject(component);

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

    hasId(): boolean {
        return this.uuid !== undefined;
    }

    hasTag(tag: TTag): boolean {
        return this.tags.has(tag);
    }

    removeComponent(component: Object | TObjectProto): Entity {
        this.components.delete(this.getConstructor(component));
        return this;
    }

    removeId(unregister: boolean = true) {
        this.uuid = undefined;
        if (unregister) {
            unregisterEntity(this);
        }
    }

    removeTag(tag: TTag): Entity {
        this.tags.delete(tag);
        return this;
    }
}
