import type {IEntity, TEntityId, TTag} from "./entity.spec";
import type {TObjectProto, TTypeProto} from "../_.spec";
import {registerEntity} from "../ecs/ecs-entity";
import type {ISerDe} from "../serde/serde.spec";

export * from './entity.spec';

let idCounter = BigInt(0);

export class Entity implements IEntity {
    static uuidFn: () => TEntityId = () => `${Date.now()}_${(idCounter++).toString()}`;
    protected components: Map<Readonly<TObjectProto>, /* mut */ object> = new Map();
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
        return this;
    }

    addTag(tag: TTag): Entity {
        this.tags.add(tag);
        return this;
    }

    protected asObject(component: Readonly<object> | TObjectProto, ...args: ReadonlyArray<unknown>): object {
        return typeof component === 'object'
            ? component
            : new (component.prototype.constructor.bind(component, ...Array.from(arguments).slice(1)))();
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
        return typeof component === 'object'
            ? component.constructor as TObjectProto
            : component;
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

    hasTag(tag: TTag): boolean {
        return this.tags.has(tag);
    }

    removeComponent(component: Readonly<object> | TObjectProto): Entity {
        this.components.delete(this.getConstructor(component));
        return this;
    }

    removeTag(tag: TTag): Entity {
        this.tags.delete(tag);
        return this;
    }
}
