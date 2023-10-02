import {type RuntimeWorld} from "./runtime-world.ts";
import type {IIStateProto} from "../../state/state.spec.ts";
import {State} from "../../state/state.ts";
import type {IScheduler} from "../../scheduler/scheduler.spec.ts";
import {EventReader} from "../../events/event-reader.ts";
import {EventBus} from "../../events/event-bus.ts";

export async function popState(this: RuntimeWorld): Promise<void> {
    unsubscribeEventsOfSchedulerSystems(this.eventBus, this.currentScheduler!);
    await (await this.pda.pop())?.deactivate(this.transitionWorld);

    const newState = this.pda.state;
    if (!newState) {
        return;
    }

    await newState.activate(this.transitionWorld);
    this.currentScheduler = this.config.stateSchedulers.get(newState.constructor as IIStateProto) ?? this.config.defaultScheduler;
    this.currentSchedulerExecutor = this.currentScheduler.getExecutor(this.eventBus);
    subscribeEventsOfSchedulerSystems(this.eventBus, this.currentScheduler);
}

export async function pushState(this: RuntimeWorld, NewState: IIStateProto): Promise<void> {
    if (this.currentScheduler) {
        unsubscribeEventsOfSchedulerSystems(this.eventBus, this.currentScheduler);
    }

    await this.pda.state?.deactivate(this.transitionWorld);
    await this.pda.push(NewState);

    const newState = this.pda.state! as State;
    await newState.create(this.transitionWorld);
    await newState.activate(this.transitionWorld);
    await this.commands.executeAll();
    this.currentScheduler = this.config.stateSchedulers.get(NewState) ?? this.config.defaultScheduler;

    if (!this.currentScheduler) {
        throw new Error(`There is no DefaultScheduler or Scheduler for ${NewState.name}!`);
    }

    this.currentSchedulerExecutor = this.currentScheduler.getExecutor(this.eventBus);
    subscribeEventsOfSchedulerSystems(this.eventBus, this.currentScheduler);
}

export function subscribeEventsOfSchedulerSystems(eventBus: EventBus, scheduler: IScheduler): void {
    const systems = scheduler.pipeline.getGroups().map(g => g.stages).flat().map(s => s.systems).flat();
    let system;
    let systemParam;

    for (system of systems) {
        for (systemParam of Object.values(system.parameterDesc)) {
            if (systemParam instanceof EventReader) {
                eventBus.subscribeReader(systemParam);
            }
        }
    }
}

export function unsubscribeEventsOfSchedulerSystems(eventBus: EventBus, scheduler: IScheduler): void {
    const systems = scheduler.pipeline.getGroups().map(g => g.stages).flat().map(s => s.systems).flat();
    let system;
    let systemParam;

    for (system of systems) {
        for (systemParam of Object.values(system.parameterDesc)) {
            if (systemParam instanceof EventReader) {
                eventBus.unsubscribeReader(systemParam);
            }
        }
    }
}
