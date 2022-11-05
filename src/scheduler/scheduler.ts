import type {IScheduler} from "./scheduler.spec";
import {type IPipeline, Pipeline} from "./pipeline/pipeline";
import type {TExecutor} from "../_.spec";
import {systemRunParamSym} from "../system/_";
import {getSystemRunParameters, ISystem} from "../system/system";
import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec";
import {IEventBus} from "../events/event-bus.spec";

export * from "./scheduler.spec";


export async function defaultSchedulingAlgorithm(stageExecutors: TExecutor[]) {
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

    set pipeline(newPipeline: IPipeline) {
        if (this.#isPrepared) {
            throw new Error('This scheduler was already prepared or is executing and cannot be changed right now!');
        }

        this.#pipeline = newPipeline;
    }

    getExecutor(eventBus: IEventBus): TExecutor {
        const stageExecutors: TExecutor[] = [];

        for (const group of this.#pipeline.getGroups()) {
            for (const stage of group.stages) {
                stageExecutors.push(stage.getExecutor(eventBus));
            }

            stageExecutors.push(async () => {
                await group.executeOnSyncHandlers();
            });
        }

        return () => this.schedulingAlgorithm(stageExecutors);
    }

    getSystems(): Set<ISystem> {
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

    async prepare(world: IRuntimeWorld): Promise<void> {
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
