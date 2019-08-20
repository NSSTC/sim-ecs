import IWorld from "./world.spec";
import IEntity from "./entity.spec";
import ISystem from "./system.spec";

export * from './system.spec';

export class System implements ISystem {
    protected _entities: IEntity[] = [];

    get entities(): IEntity[] {
        return this._entities;
    }

    canUseEntity(entity: IEntity): boolean {
        return false;
    }

    update(world: IWorld, entities: IEntity[], deltaTime: number): void {
        throw new Error(`You have to overwrite the update() method of ${this.constructor.name}!`);
    }
}
