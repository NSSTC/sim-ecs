import {ISystemActions} from "./world.spec";
import {ISystem, NoData, TComponentAccess, TSystemData} from "./system.spec";
import {TTypeProto} from "./_.spec";
import IEntity from "./entity.spec";

export * from './system.spec';

export abstract class System<D extends TSystemData> implements ISystem<D> {
    private systemDataBlueprint?: D;
    abstract readonly SystemDataType: TTypeProto<D>;

    canUseEntity(entity: IEntity): boolean {
        if (this.SystemDataType.prototype == NoData.prototype) {
            return false
        }

        this.systemDataBlueprint ||= new this.SystemDataType();
        return entity.matchesQueue(Object.values(this.systemDataBlueprint) as TComponentAccess<any>[]);
    }

    abstract run(dataSet: Set<D>): Promise<void>;

    setup(actions: ISystemActions): void {}
}
