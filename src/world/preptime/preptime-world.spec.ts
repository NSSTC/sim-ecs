import type {IWorld} from "../world.spec";
import type {IRuntimeWorld, TExecutionFunction} from "../runtime/runtime-world.spec";
import type {IScheduler} from "../../scheduler/scheduler.spec";
import type {ISerDe} from "../../serde/serde.spec";
import type {IIStateProto} from "../../state/state.spec";
import type {TObjectProto} from "../../_.spec";
import {IEntity} from "../../entity/entity.spec";
import {TGroupHandle} from "../world.spec";


export interface IPreptimeData {
    entities: Set<IEntity>
    groups: {
        nextHandle: TGroupHandle,
        entityLinks: Map<TGroupHandle, Set<IEntity>>,
    }
    resources: Map<object | TObjectProto, Array<unknown>>
}

export interface IPreptimeOptions {
    executionFunction: TExecutionFunction
    initialState: IIStateProto
}

export interface IPreptimeWorldConfig {
    defaultScheduler: IScheduler
    serde: ISerDe
    stateSchedulers: Map<IIStateProto, IScheduler>
}

export interface IPreptimeWorld extends IWorld {
    /**
     * Configuration of how a runtime should work
     */
    config: IPreptimeWorldConfig
    /**
     * Initial data to operate on
     */
    data: IPreptimeData
    /**
     * World's name
     */
    readonly name?: string

    /**
     * Prepare a runtime environment from this world
     */
    prepareRun(options?: Partial<IPreptimeOptions>): Promise<IRuntimeWorld>
}
