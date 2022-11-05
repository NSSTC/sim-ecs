import type {IWorld} from "../world.spec";
import type {IRuntimeWorld, TExecutionFunction} from "../runtime/runtime-world.spec";
import type {IScheduler} from "../../scheduler/scheduler.spec";
import type {ISerDe} from "../../serde/serde.spec";
import type {IIStateProto, IState} from "../../state/state.spec";
import type {IWorldData} from "../world.spec";


export interface IPrepOptions {
    executionFunction: TExecutionFunction
    initialState: IIStateProto
}

export interface IPreptimeWorldConfig {
    defaultScheduler: IScheduler
    serde: ISerDe
    states: Set<IState>
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
    data: IWorldData
    /**
     * World's name
     */
    readonly name?: string

    /**
     * Prepare a runtime environment from this world
     */
    prepareRun(options?: Partial<IPrepOptions>): Promise<IRuntimeWorld>
}
