import {IEntityWorld} from "./world.spec";
import IEntity, {TTag} from "./entity.spec";
import {TObjectProto, TTypeProto} from "./_.spec";
import {access, EAccess, ETargetType, TAccessDescriptor} from "./query.spec";

export * from './entity.spec';

export class Entity implements IEntity {
    protected components: Map<TObjectProto, Object> = new Map();
    protected tags: Set<TTag> = new Set();

    constructor(
        protected world?: IEntityWorld
    ) {}

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

    changeWorldTo(newWorld?: IEntityWorld): void {
        const updateSystems = this.world?.isDirty && this.world?.isRunning;

        updateSystems && this.world?.removeEntityFromSystems(this);
        this.world?.removeEntity(this);
        this.world = newWorld;
        this.world?.addEntity(this);
        updateSystems && this.world?.assignEntityToSystems(this);
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

    matchesQueue<C extends Object, T extends TAccessDescriptor<C>>(query: T[]): boolean {
        let requirement: TAccessDescriptor<C>;
        let accessDesc;

        for (requirement of query) {
            accessDesc = requirement[access];

            if (accessDesc.type == EAccess.meta) {
                continue;
            }

            switch (accessDesc.targetType) {
                case ETargetType.component: {
                    if (this.components.has(accessDesc.target as TTypeProto<C>) == (accessDesc.type == EAccess.unset)) {
                        return false;
                    }

                    break;
                }
                case ETargetType.tag: {
                    if (this.tags.has(accessDesc.target as TTag) == (accessDesc.type == EAccess.unset)) {
                        return false;
                    }

                    break;
                }
            }
        }

        return true;
    }

    removeComponent(component: Object): Entity {
        this.components.delete(component.constructor as TObjectProto);

        // this will refresh the entity in the world
        // todo: improve cache-propagation to be more efficient and transparent
        this.changeWorldTo(this.world);

        return this;
    }

    removeTag(tag: TTag): Entity {
        this.tags.delete(tag);
        return this;
    }
}
