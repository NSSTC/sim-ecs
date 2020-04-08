import IWorld from "./world.spec";
import IEntity from "./entity.spec";
import ISystem from "./system.spec";
import {TObjectProto, TTypeProto} from "./_.spec";

export * from './entity.spec';

export class Entity implements IEntity {
    protected components: Map<string, Object> = new Map();
    protected world?: IWorld;

    constructor(world?: IWorld) {
        this.world = world;
    }

    addComponent(component: Object): IEntity {
        this.addComponentQuick(component);
        this.world && this._updateSystems(this.world);

        return this;
    }

    addComponentQuick(component: Object): IEntity {
        if (this.hasComponent(component.constructor as typeof Object)) {
            throw new Error(`Component "${component.constructor.name}" already exists on entity!`)
        }

        this.components.set(component.constructor.name, component);
        return this;
    }

    destroy(): void {
        this.world?.removeEntity(this);
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
        if (!this.components.has(component.constructor.name)) return this;

        this.components.delete(component.constructor.name);
        this.world && this._updateSystems(this.world);

        return this;
    }

    setWorld(world: IWorld): IEntity {
        if (this.world) {
            let system: ISystem;
            for (system of this.world.systems) {
                if (system.entities.includes(this)) {
                    system.entities.splice(system.entities.indexOf(this), 1);
                }
            }
        }

        this.world = world;
        this._updateSystems(world);

        return this;
    }

    _updateSystem(world: IWorld, system: ISystem): void {
        if (!world.systems.includes(system)) {
            throw new Error('The world does not contain the system ' + system.constructor.name);
        }

        if (system.canUseEntity(this) && !system.entities.includes(this)) {
            system.entities.push(this);
        }
        else if (system.entities.includes(this)) {
            system.entities.splice(system.entities.indexOf(this), 1);
        }
    }

    _updateSystems(world: IWorld): void {
        let system: ISystem;
        for (system of world.systems) {
            this._updateSystem(world, system);
        }
    }
}
