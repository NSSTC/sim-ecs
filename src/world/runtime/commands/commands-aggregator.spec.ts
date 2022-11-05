export type TCommand = () => Promise<void> | void;

export interface ICommandsAggregator {
    /**
     * Add a command to be executed later
     * @param command
     */
    addCommand(command: TCommand): void

    /**
     * Execute all commands which have been aggregated
     */
    executeAll(): Promise<void>
}
