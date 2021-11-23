import {IStage} from "./stage.spec";
import {ISystem} from "../../system";
import {ISystemActions} from "../../world.spec";

export * from "./stage.spec";

export async function defaultSchedulingAlgorithm(actions: ISystemActions, systems: ISystem[]) {
    const promises = [];
    let system;

    for (system of systems) {
        promises.push(system.run(actions));
    }

    await Promise.all(promises);
}

export class Stage implements IStage {
    schedulingAlgorithm = defaultSchedulingAlgorithm;
    systems: ISystem[] = [];

    execute(actions: ISystemActions) {
        return this.schedulingAlgorithm(actions, this.systems);
    }
}
