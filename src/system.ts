import {ISystemWorld} from "./world.spec";
import {access, EAccess, ISystem, TComponentAccess, TSystemData} from "./system.spec";
import {TTypeProto} from "./_.spec";
import IEntity from "./entity.spec";

export * from './system.spec';

export class SystemData implements TSystemData {
    [fieldName: string]: Object;
}

export abstract class System<D extends TSystemData> implements ISystem<D> {
    private _dataQuery?: D;
    abstract readonly SystemData: TTypeProto<D>;

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

    abstract update(world: ISystemWorld, dataSet: Set<D>): Promise<void>;
}
