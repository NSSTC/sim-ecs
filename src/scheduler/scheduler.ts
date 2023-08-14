import type {IScheduler} from "./scheduler.spec.ts";
import {type IPipeline, Pipeline} from "./pipeline/pipeline.ts";
import type {TExecutor} from "../_.spec.ts";
import {systemRunParamSym} from "../system/_.ts";
import {getSystemRunParameters, ISystem} from "../system/system.ts";
import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec.ts";
import type {IEventBus} from "../events/event-bus.spec.ts";

export * from "./scheduler.spec.ts";


export async function defaultSchedulingAlgorithm(stageExecutors: ReadonlyArray<TExecutor>) {
    let stageExecutor;
    for (stageExecutor of stageExecutors) {
        await stageExecutor();
    }
}

export class Scheduler implements IScheduler {
    #isPrepared = false;
    #pipeline: IPipeline = new Pipeline();
    schedulingAlgorithm = defaultSchedulingAlgorithm;

    get isPrepared(): boolean {
        return this.#isPrepared;
    }

    get pipeline(): IPipeline {
        return this.#pipeline;
    }

    set pipeline(newPipeline: Readonly<IPipeline>) {
        if (this.#isPrepared) {
            throw new Error('This scheduler was already prepared or is executing and cannot be changed right now!');
        }

        this.#pipeline = newPipeline;
    }

    getExecutor(eventBus: Readonly<IEventBus>): TExecutor {
        const stageExecutors: TExecutor[] = [];

        for (const group of this.#pipeline.getGroups()) {
            for (const stage of group.stages) {
                stageExecutors.push(stage.getExecutor(eventBus));
            }

            stageExecutors.push(group.executeOnSyncHandlers.bind(group) as () => Promise<any>);
        }

        return this.schedulingAlgorithm.bind(this, stageExecutors);
    }

    getSystems(): ReadonlySet<ISystem> {
        const systems = new Set<ISystem>();
        let group, stage, system;

        for (group of this.pipeline.getGroups()) {
            for (stage of group.stages) {
                for (system of stage.systems) {
                    systems.add(system);
                }
            }
        }

        return systems;
    }

    async prepare(world: Readonly<IRuntimeWorld>): Promise<void> {
        let stage;
        let syncPoint;
        let system;

        this.#isPrepared = false;

        for (syncPoint of this.pipeline.getGroups().values()) {
            for (stage of syncPoint.stages) {
                for (system of stage.systems) {
                    system[systemRunParamSym] = getSystemRunParameters(system, world);
                    await system.setupFunction.call(system, system[systemRunParamSym]!);
                }
            }
        }

        this.#isPrepared = true;
    }
}
