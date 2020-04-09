import {ISystemWorld} from "./world.spec";
import {TTypeProto} from "./_.spec";
import IEntity from "./entity.spec";

export const access = Symbol();

export enum EAccess {
    READ,
    WRITE,
    SET,
    UNSET,
}

export type TComponentAccess<C extends Object> = {
    [access]: {
        readonly component: TTypeProto<C>
        readonly type: EAccess
    }
}
export type TSystemData = { [fieldName: string]: Object };

export function Read<C extends Object>(componentPrototype: TTypeProto<C>): C & TComponentAccess<C> {
    return Object.assign({}, componentPrototype.prototype, {
        [access]: {
            component: componentPrototype,
            type: EAccess.READ,
        },
    });
}

export function Write<C extends Object>(componentPrototype: TTypeProto<C>): C & TComponentAccess<C> {
    return Object.assign({}, componentPrototype.prototype, {
        [access]: {
            component: componentPrototype,
            type: EAccess.WRITE,
        },
    });
}

export function With<C extends Object>(componentPrototype: TTypeProto<C>): TComponentAccess<C> {
    return {
        [access]: {
            component: componentPrototype,
            type: EAccess.SET,
        }
    };
}

export function Without<C extends Object>(componentPrototype: TTypeProto<C>): TComponentAccess<C> {
    return {
        [access]: {
            component: componentPrototype,
            type: EAccess.UNSET,
        }
    };
}

export interface ISystem<D extends TSystemData> {
    readonly SystemData: TTypeProto<D>;

    /**
     * Have the system check weather it should use an entity.
     * @param entity
     */
    canUseEntity(entity: IEntity): boolean

    /**
     * Update components during a dispatch
     * @param world
     * @param dataSet
     */
    update(world: ISystemWorld, dataSet: Set<D>): Promise<void>
}

export type TSystemProto<T extends TSystemData> = { new(): ISystem<T> };
export default ISystem;
