import {IStage} from "./stage.spec";
import {getSystemRunParameters, ISystem} from "../../system";
import {IStageAction, ISystemActions} from "../../world.spec";
import {TExecutor} from "../../_.spec";

export * from "./stage.spec";

export async function defaultSchedulingAlgorithm(actions: ISystemActions, systems: ISystem[]): Promise<void> {
    const promises = [];
    let system;

    for (system of systems) {
        // todo: oh fuck! check the parameters first and then call this!
        promises.push(system.runFunction.apply(system, getSystemRunParameters(system)));
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
        return () => this.schedulingAlgorithm(actions.systemActions, Array.from(actions.systems));
    }
}
