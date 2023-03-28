import type {IStage, TStageSchedulingAlgorithm} from "./stage.spec.ts";
import type {ISystem} from "../../system/system.spec.ts";
import type {TExecutor, TTypeProto} from "../../_.spec.ts";
import {systemRunParamSym} from "../../system/_.ts";
import {SystemError} from "../../world/error.ts";
import type {IEventBus} from "../../events/event-bus.spec.ts";

export * from "./stage.spec.ts";

export async function defaultStageSchedulingAlgorithm(systems: ReadonlyArray<Readonly<ISystem>>, eventBus: Readonly<IEventBus>): Promise<void> {
    let system;

    try {
        for (system of systems) {
            // todo: check WRITE constraints to speed it up...
            await system.runFunction.call(system, system[systemRunParamSym]!);
        }
    } catch (error) {
        if (error instanceof Error && !!system) {
            await eventBus.publish(new SystemError(error, system.constructor as TTypeProto<ISystem>));
        } else {
            throw error;
        }
    }
}

export class Stage implements IStage {
    public schedulingAlgorithm: TStageSchedulingAlgorithm = defaultStageSchedulingAlgorithm;
    public systems: Array<ISystem> = [];

    addSystem(System: Readonly<ISystem>): Stage {
        this.systems.push(System);
        return this;
    }

    getExecutor(eventBus: Readonly<IEventBus>): TExecutor {
        return this.schedulingAlgorithm.bind(this, this.systems, eventBus);
    }
}
