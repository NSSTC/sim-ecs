import type {ICommandsAggregator, TCommand} from "./commands-aggregator.spec.ts";


export * from "./commands-aggregator.spec.ts";

export class CommandsAggregator implements ICommandsAggregator {
    commands: Array<TCommand> = [];

    addCommand(command: TCommand): void {
        this.commands.push(command);
    }

    async executeAll(): Promise<void> {
        const length = this.commands.length;

        for (let i = 0; i < length; i++) {
            await this.commands[i]();
        }

        this.commands.length = 0;
    }
}
