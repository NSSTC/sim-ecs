import {IEntityWorld} from "./world.spec";
import IEntity from "./entity.spec";
import {TObjectProto, TTypeProto} from "./_.spec";
import {access, EAccess, TComponentAccess} from "./system.spec";

export * from './entity.spec';

export class Entity implements IEntity {
    protected components: Map<TObjectProto, Object> = new Map();
    protected world?: IEntityWorld;

    constructor(world?: IEntityWorld) {
        this.world = world;
    }

    addComponent(component: Object): IEntity {
        if (this.hasComponent(component.constructor as typeof Object)) {
            throw new Error(`Component "${component.constructor.name}" already exists on entity!`)
        }

        this.components.set(component.constructor as TObjectProto, component);
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

    hasComponent(component: typeof Object | TObjectProto): boolean {
        return this.components.has(component);
    }

    matchesQueue<C extends Object, T extends TComponentAccess<C>>(query: T[]): boolean {
        let requirement: TComponentAccess<C>;
        let componentAccess;

        for (requirement of query) {
            componentAccess = requirement[access];

            if (componentAccess.type == EAccess.META) {
                continue;
            }

            if (this.components.has(componentAccess.component) == (componentAccess.type == EAccess.UNSET)) {
                return false;
            }
        }

        return true;
    }

    removeComponent(component: Object): IEntity {
        if (this.components.has(component.constructor as TObjectProto)) {
            this.components.delete(component.constructor as TObjectProto);
        }

        // this will refresh the entity in the world
        this.changeWorldTo(this.world);

        return this;
    }
}
