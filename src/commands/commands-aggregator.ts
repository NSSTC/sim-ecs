import {ICommandsAggregator, TCommand} from "./commands-aggregator.spec";
import IWorld from "../world.spec";

export * from "./commands-aggregator.spec";

export class CommandsAggregator implements ICommandsAggregator {
    commands: TCommand[] = [];
    doMaintain = false;

    constructor(
        protected world: IWorld,
    ) {}

    addCommand(command: TCommand): void {
        this.commands.push(command);
    }

    async executeAll(): Promise<void> {
        for (let command = this.commands.shift(); !!command; command = this.commands.shift()) {
            await command();
        }

        if (this.doMaintain) {
            this.world.maintain();
        }
    }

    triggerMaintain() {
        this.doMaintain = true;
    }
}
