import {IStage} from "./stage.spec";
import {ISystem, ISystemProto} from "../../system";
import {ISystemActions} from "../../world.spec";

export * from "./stage.spec";

export async function defaultSchedulingAlgorithm(actions: ISystemActions, systems: ISystem[]): Promise<void> {
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

    addSystem(System: ISystemProto): Stage {
        this.systems.push(new System());
        return this;
    }

    execute(actions: ISystemActions): Promise<void> {
        return this.schedulingAlgorithm(actions, this.systems);
    }
}
