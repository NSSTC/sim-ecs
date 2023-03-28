import type {ICommandsAggregator, TCommand} from "./commands-aggregator.spec.ts";


export * from "./commands-aggregator.spec.ts";

export class CommandsAggregator implements ICommandsAggregator {
    commands: TCommand[] = [];

    addCommand(command: TCommand): void {
        this.commands.push(command);
    }

    async executeAll(): Promise<void> {
        for (let command = this.commands.shift(); !!command; command = this.commands.shift()) {
            await command();
        }
    }
}
