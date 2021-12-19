import {ISystemActions, System} from "../../../../../src";

export class CounterResource {
    count = 0

    constructor(
        public requiredIterCount: number
    ) {}
}

export class CheckEndSystem extends System {
    protected counter!: CounterResource;

    setup(actions: ISystemActions): void | Promise<void> {
        this.counter = actions.getResource(CounterResource);
    }

    run(actions: ISystemActions): void {
        if (this.counter.count++ >= this.counter.requiredIterCount) {
            actions.commands.stopRun();
        }
    }
}
