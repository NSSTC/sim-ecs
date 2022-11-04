import type {IStage} from "./stage.spec";
import type {ISystem} from "../../system/system.spec";
import type {TExecutor, TTypeProto} from "../../_.spec";
import {systemRunParamSym} from "../../system/_";
import {SystemError} from "../../world/error";
import type {World} from "../../world";

export * from "./stage.spec";

export async function defaultStageSchedulingAlgorithm(world: World, systems: ISystem[]): Promise<void> {
    let system;

    for (system of systems) {
        try {
            // todo: check WRITE constraints to speed it up...
            await system.runFunction.call(system, system[systemRunParamSym]!);
        } catch (error) {
            if (error instanceof Error && !!system) {
                await world.eventBus.publish(new SystemError(error, system.constructor as TTypeProto<ISystem>));
            } else {
                throw error;
            }
        }
    }
}

export class Stage implements IStage {
    schedulingAlgorithm = defaultStageSchedulingAlgorithm;
    systems: ISystem[] = [];

    addSystem(System: ISystem): Stage {
        this.systems.push(System);
        return this;
    }

    getExecutor(world: World): TExecutor {
        return () => this.schedulingAlgorithm(world, Array.from(this.systems));
    }
}
