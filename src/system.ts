import {ISystemActions} from "./world.spec";
import {access, EAccess, ISystem, NoData, TComponentAccess, TSystemData} from "./system.spec";
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

        {
            let accessStruct: TComponentAccess<any>;
            for (let componentRequirement of Object.values(this.systemDataBlueprint)) {
                accessStruct = componentRequirement as TComponentAccess<any>;

                if (accessStruct[access].type == EAccess.META) {
                    continue;
                }

                if (!entity.hasComponent(accessStruct[access].component) || accessStruct[access].type == EAccess.UNSET) {
                    return false;
                }
            }
        }

        return true;
    }

    abstract run(dataSet: Set<D>): Promise<void>;

    setup(actions: ISystemActions): void {}
}
