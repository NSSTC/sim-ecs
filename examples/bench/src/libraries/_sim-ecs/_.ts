import {Actions, createSystem, WriteResource, ISystemActions} from "../../../../../src";

export class CounterResource {
    count = 0

    constructor(
        public requiredIterCount: number
    ) {}
}

export const CheckEndSystem = createSystem({
    actions: Actions,
    counter: WriteResource(CounterResource),
}).withRunFunction(({actions, counter}) => {
    if (counter.count++ >= counter.requiredIterCount) {
        actions.commands.stopRun();
    }
}).build();

