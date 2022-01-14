import {IStage} from "./stage.spec";
import {ISystem} from "../../system";
import {IStageAction, ISystemActions} from "../../world.spec";
import {TExecutor} from "../../_.spec";
import {systemRunParamSym} from "../../system/_";

export * from "./stage.spec";

export async function defaultSchedulingAlgorithm(actions: ISystemActions, systems: ISystem[]): Promise<void> {
    const promises = [];
    let system;

    for (system of systems) {
        promises.push(system.runFunction.call(system, system[systemRunParamSym]!));
    }

    await Promise.all(promises);
}

export class Stage implements IStage {
    schedulingAlgorithm = defaultSchedulingAlgorithm;
    systems: ISystem[] = [];

    addSystem(System: ISystem): Stage {
        this.systems.push(System);
        return this;
    }

    getExecutor(actions: IStageAction): TExecutor {
        return () => this.schedulingAlgorithm(actions.systemActions, Array.from(this.systems));
    }
}
