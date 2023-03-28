import type {ISystem} from "../../system/system.spec.ts";
import type {TExecutor} from "../../_.spec.ts";
import type {IEventBus} from "../../events/event-bus.spec.ts";

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
