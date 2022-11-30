import type {IIStateProto, IState} from "../../state/state.spec";
import type {IScheduler} from "../../scheduler/scheduler.spec";
import type {ISerDe} from "../../serde/serde.spec";
import type {IImmutableWorld} from "../world.spec";
import {IEventBus} from "../../events/event-bus.spec";
import {ISystemActions, ITransitionActions} from "../actions.spec";
import {IEntity} from "../../entity/entity.spec";
import {InstanceMap} from "../../util/instance-map";
import {TObjectProto, TTypeProto} from "../../_.spec";
import {TGroupHandle} from "../world.spec";
import {ISystem} from "../../system/system.spec";

export * from './commands/commands.spec';


export type TExecutionFunction = ((callback: Function) => any) | typeof setTimeout | typeof requestAnimationFrame;

export interface IRuntimeWorldData {
    entities: Set<IEntity>
    groups: {
        nextHandle: TGroupHandle
        entityLinks: Map<TGroupHandle, Set<IEntity>>
    }
    resources: InstanceMap<TObjectProto>
}

export interface IRuntimeWorldInitData {
    entities: Set<IEntity>
    groups: {
        nextHandle: TGroupHandle
        entityLinks: Map<TGroupHandle, Set<IEntity>>
    }
    resources: Map<object | TObjectProto, Array<unknown>>
}

export interface IRuntimeWorldInitConfig {
    readonly defaultScheduler: IScheduler
    readonly executionFunction?: TExecutionFunction | undefined
    readonly initialState: IIStateProto
    readonly serde: Readonly<ISerDe>
    readonly stateSchedulers: ReadonlyMap<IIStateProto, IScheduler>
}

export interface IRuntimeWorld extends IImmutableWorld {
    /**
     * Initial config
     */
    readonly config: Readonly<IRuntimeWorldInitConfig>
    /**
     * Advertises the current state
     */
    readonly currentState: Readonly<IState> | undefined
    /**
     * Data to operate on.
     * This data may mutate at any time
     */
    data: IRuntimeWorldData
    /**
     * Boolean indicator if the world is currently executing
     */
    readonly isRunning: boolean
    /**
     * This promise resolves when the execution terminates
     */
    readonly awaiter?: Promise<void>
    /**
     * Architecture to send messages between systems
     */
    readonly eventBus: IEventBus
    /**
     * World's name
     */
    readonly name: string
    /**
     * Object containing all actions available inside a system
     */
    readonly systemActions: ISystemActions
    /**
     * Object containing all actions available on step-to-step transitions, as well as to states
     */
    readonly transitionActions: ITransitionActions

    /**
     * Replace a resource from this world with a new value
     * @param obj
     * @param args
     */
    replaceResource<T extends object>(obj: T | TTypeProto<T>, ...args: Array<unknown>): void

    /**
     * Start a continuous execution.
     * The Promise resolves when the execution terminates
     */
    start(): Promise<void>

    /**
     * Execute a single step.
     * The Promise resolves when the execution terminates
     */
    step(): Promise<void>

    /**
     * Terminate execution
     */
    stop(): void
}
