import {ISystemActions} from "./world.spec";
import {TTypeProto} from "./_.spec";
import {IEntity} from "./entity";

export type TSystemData = { [fieldName: string]: Object };

export class SystemData implements TSystemData {
    [fieldName: string]: Object;
}

/**
 * Use this to signal that you don't want to process data in this system
 */
export class NoData extends SystemData {
    private _NoDataMarker: object = Object.create(null);
}

export interface ISystem<D extends TSystemData> {
    readonly SystemDataType: TTypeProto<D>;

    /**
     * Have the system check weather it should use an entity.
     * @param entity
     */
    canUseEntity(entity: IEntity): boolean

    /**
     * Called after dispatching or running a world
     * @param actions
     */
    destroy(actions: ISystemActions): void | Promise<void>

    /**
     * Run the system logic during a dispatch
     * @param dataSet
     */
    run(dataSet: Set<D>): Promise<void>

    /**
     * Called before dispatching or running a world
     * @param actions
     */
    setup(actions: ISystemActions): void | Promise<void>
}

export type TSystemProto<T extends TSystemData> = { new(): ISystem<T> };
export default ISystem;
