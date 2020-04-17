import {ISystemActions} from "./world.spec";
import {access, EAccess, ISystem, TComponentAccess, TSystemData} from "./system.spec";
import {TTypeProto} from "./_.spec";
import IEntity from "./entity.spec";

export * from './system.spec';

export abstract class System<D extends TSystemData> implements ISystem<D> {
    private _dataQuery?: D;
    abstract readonly SystemDataType: TTypeProto<D>;

    canUseEntity(entity: IEntity): boolean {
        if (!this._dataQuery) {
            this._dataQuery = new this.SystemDataType();
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

    abstract update(actions: ISystemActions, dataSet: Set<D>): Promise<void>;
}
