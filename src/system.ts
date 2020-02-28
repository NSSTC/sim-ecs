import {ISystemWorld} from "./world.spec";
import IEntity from "./entity.spec";
import {EComponentRequirement, ISystem, TComponentQuery} from "./system.spec";

export * from './system.spec';

export class System implements ISystem {
    protected _entities: IEntity[] = [];
    protected _componentQuery?: TComponentQuery;

    get componentQuery(): TComponentQuery {
        return this._componentQuery || [];
    }

    get entities(): IEntity[] {
        return this._entities;
    }

    canUseEntity(entity: IEntity): boolean {
        for (let componentRequirement of this._componentQuery || []) {
            if (
                !entity.hasComponent(componentRequirement[0]) ||
                componentRequirement[1] === EComponentRequirement.UNSET
            ) return false;
        }

        return true;
    }

    clearEntities(): void {
        this._entities.length = 0;
    }

    setComponentQuery(componentQuery: TComponentQuery): ISystem {
        if (this._componentQuery) throw new Error('Component query already set!');

        this._componentQuery = componentQuery;
        return this;
    }

    update(world: ISystemWorld, entities: IEntity[], deltaTime: number): Promise<void> {
        throw new Error(`You have to overwrite the update() method of ${this.constructor.name}!`);
    }
}
