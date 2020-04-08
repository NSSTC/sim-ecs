import {ISystemWorld} from "./world.spec";
import {access, EAccess, ISystem, TComponentAccess, TSystemData} from "./system.spec";
import {TTypeProto} from "./_.spec";
import IEntity from "./entity.spec";

export * from './system.spec';

export class SystemData implements TSystemData {
    [fieldName: string]: Object;
}

export abstract class System<T extends TSystemData> implements ISystem<T> {
    private _entities: Set<IEntity> = new Set();
    private _dataQuery?: T;
    abstract readonly SystemData: TTypeProto<T>;

    get entities(): Set<IEntity> {
        return this._entities;
    }

    canUseEntity(entity: IEntity): boolean {
        if (!this._dataQuery) {
            this._dataQuery = new this.SystemData();
        }

        let accessStruct: TComponentAccess<any>;
        for (let componentRequirement of Object.values(this._dataQuery)) {
            accessStruct = componentRequirement as TComponentAccess<any>;

            if (!entity.hasComponent(accessStruct[access].component) || accessStruct[access].type == EAccess.UNSET) {
                return false;
            }
        }

        return true;
    }

    clearEntities(): void {
        this._entities.clear();
    }

    abstract update(world: ISystemWorld, dataSet: Set<T>): Promise<void>;
}
