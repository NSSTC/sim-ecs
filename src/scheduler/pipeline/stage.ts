import {IStage} from "./stage.spec";
import {ISystem, ISystemProto} from "../../system";
import {IStageAction, ISystemActions} from "../../world.spec";
import {TExecutor} from "../../_.spec";

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
    systemProtos: ISystemProto[] = [];

    addSystem(System: ISystemProto): Stage {
        this.systemProtos.push(System);
        return this;
    }

    getExecutor(actions: IStageAction): TExecutor {
        const systems: ISystem[] = [];

        for (const systemProto of this.systemProtos) {
            systems.push(actions.systems.get(systemProto)!);
        }

        return () => this.schedulingAlgorithm(actions.systemActions, systems);
    }
}
