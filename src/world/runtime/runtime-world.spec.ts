import type {IIStateProto, IState} from "../../state/state.spec";
import type {IScheduler} from "../../scheduler/scheduler.spec";
import type {ISerDe} from "../../serde/serde.spec";
import type {IImmutableWorld, IWorld, IWorldData} from "../world.spec";
import {IEventBus} from "../../events/event-bus.spec";
import {ISystemActions, ITransitionActions} from "../actions.spec";


export type TExecutionFunction = ((callback: Function) => any) | typeof setTimeout | typeof requestAnimationFrame;

export interface IRuntimeWorldInitConfig {
    readonly defaultScheduler: IScheduler
    readonly executionFunction?: TExecutionFunction | undefined
    readonly initialState: IIStateProto
    readonly serde: Readonly<ISerDe>
    readonly states: ReadonlySet<IState>
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
    data: IWorldData
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
