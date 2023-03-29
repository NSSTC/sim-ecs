import type {IWorld} from "../world.spec.ts";
import type {IRuntimeWorld, TExecutionFunction} from "../runtime/runtime-world.spec.ts";
import type {IScheduler} from "../../scheduler/scheduler.spec.ts";
import type {ISerDe} from "../../serde/serde.spec.ts";
import type {IIStateProto} from "../../state/state.spec.ts";
import type {TObjectProto} from "../../_.spec.ts";
import type {IEntity} from "../../entity/entity.spec.ts";
import type {TGroupHandle} from "../world.spec.ts";


export interface IPreptimeData {
    entities: Set<IEntity>
    groups: {
        nextHandle: TGroupHandle,
        entityLinks: Map<TGroupHandle, Set<IEntity>>,
    }
    resources: Map<object | TObjectProto, ReadonlyArray<unknown>>
}

export interface IPreptimeOptions {
    executionFunction: TExecutionFunction
    initialState: IIStateProto
}

export interface IPreptimeWorldConfig {
    defaultScheduler: Readonly<IScheduler>
    serde: Readonly<ISerDe>
    stateSchedulers: Map<IIStateProto, Readonly<IScheduler>>
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
     * Get a list of RuntimeWorlds which was generated from this PreptimeWorld
     */
    getExistingRuntimeWorlds(): ReadonlyArray<IRuntimeWorld>

    /**
     * Prepare a runtime environment from this world
     */
    prepareRun(options?: Readonly<Partial<IPreptimeOptions>>): Promise<IRuntimeWorld>
}
