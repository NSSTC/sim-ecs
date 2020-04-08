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

    protected static buildDataObjects<T extends TSystemData>(dataProto: TTypeProto<TSystemData>, entities: IEntity[]): Set<T> {
        const result: Set<T> = new Set();
        let dataObj: T;

        for (const entity of entities) {
            dataObj = new dataProto() as T;
            for (const entry of Object.entries(dataObj)) {
                // @ts-ignore
                dataObj[entry[0]] = entity.getComponent(entry[1][access].component);
            }

            result.add(dataObj);
        }

        return result;
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
            let system: ISystem<any>;
            for (system of this.world.systems) {
                if (system.entities.has(this)) {
                    system.entities.delete(this);
                }
            }
        }

        this.world = world;
        this._updateSystems(world);

        return this;
    }

    _updateSystem(world: IWorld, system: ISystem<any>): void {
        if (!world.systems.includes(system)) {
            throw new Error('The world does not contain the system ' + system.constructor.name);
        }

        if (system.canUseEntity(this)) {
            if (!system.entities.has(this)) {
                system.entities.add(this);
            }
        }
        else if (system.entities.has(this)) {
            system.entities.delete(this);
        }
    }

    _updateSystems(world: IWorld): void {
        let system: ISystem<any>;
        for (system of world.systems) {
            this._updateSystem(world, system);
        }
    }
}
