import {IEntityWorld} from "./world.spec";
import IEntity from "./entity.spec";
import {TObjectProto, TTypeProto} from "./_.spec";

export * from './entity.spec';

export class Entity implements IEntity {
    protected components: Map<string, Object> = new Map();
    protected world?: IEntityWorld;

    constructor(world?: IEntityWorld) {
        this.world = world;
    }

    addComponent(component: Object): IEntity {
        if (this.hasComponent(component.constructor as typeof Object)) {
            throw new Error(`Component "${component.constructor.name}" already exists on entity!`)
        }

        this.components.set(component.constructor.name, component);
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
        return this.components.get(component.name) as T;
    }

    hasComponent(component: typeof Object | TObjectProto): boolean {
        return this.components.has(component.name);
    }

    hasComponentName(name: string): boolean {
        return this.components.has(name);
    }

    removeComponent(component: Object): IEntity {
        if (this.components.has(component.constructor.name)) {
            this.components.delete(component.constructor.name);
        }

        // this will refresh the entity in the world
        this.changeWorldTo(this.world);

        return this;
    }
}
