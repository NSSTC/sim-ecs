import IWorld from "./world.spec";
import IEntity from "./entity.spec";
import ISystem, {access, TSystemData} from "./system.spec";
import {TObjectProto, TTypeProto} from "./_.spec";

export * from './entity.spec';

export class Entity implements IEntity {
    protected components: Map<string, Object> = new Map();
    protected world?: IWorld;

    constructor(world?: IWorld) {
        this.world = world;
    }

    addComponent(component: Object): IEntity {
        if (this.hasComponent(component.constructor as typeof Object)) {
            throw new Error(`Component "${component.constructor.name}" already exists on entity!`)
        }

        this.components.set(component.constructor.name, component);
        return this;
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

        return this;
    }
}
