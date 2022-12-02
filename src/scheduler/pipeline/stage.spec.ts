import type {ISystem} from "../../system/system.spec";
import type {TExecutor} from "../../_.spec";
import type {IEventBus} from "../../events/event-bus.spec";

export type TStageSchedulingAlgorithm = (systems: ReadonlyArray<Readonly<ISystem>>, eventBus: Readonly<IEventBus>) => Promise<void>;

export interface IStage {
    schedulingAlgorithm: TStageSchedulingAlgorithm
    systems: Array<ISystem>

    /**
     * Append a system to this stage
     * @param system
     */
    addSystem(system: Readonly<ISystem<any>>): IStage

    /**
     * Get executor to run this stage once
     * @param eventBus
     */
    getExecutor(eventBus: Readonly<IEventBus>): TExecutor
}
