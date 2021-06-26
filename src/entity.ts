import {IEntity, TTag} from "./entity.spec";
import {TObjectProto, TTypeProto} from "./_.spec";

export * from './entity.spec';

export class Entity implements IEntity {
    protected components: Map<TObjectProto, Object> = new Map();
    protected tags: Set<TTag> = new Set();

    addComponent(component: Object): Entity {
        if (this.hasComponent(component.constructor as typeof Object)) {
            throw new Error(`Component "${component.constructor.name}" already exists on entity!`)
        }

        this.components.set(component.constructor as TObjectProto, component);
        return this;
    }

    addTag(tag: TTag): Entity {
        this.tags.add(tag);
        return this;
    }

    getComponent<T extends Object>(component: TTypeProto<T>): T | undefined {
        return this.components.get(component) as T;
    }

    getComponents(): IterableIterator<Object> {
        return this.components.values();
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

    removeComponent(component: Object): Entity {
        this.components.delete(component.constructor as TObjectProto);
        return this;
    }

    removeTag(tag: TTag): Entity {
        this.tags.delete(tag);
        return this;
    }
}
