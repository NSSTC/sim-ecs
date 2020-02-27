// todo: this PushDownAutomaton could get its own package on npm
export interface IPushDownAutomaton<T> {
    readonly state?: T
    clear(): void
    pop(): T | undefined
    push(state: T): void
}

export type TPushDownAutomatonProto<T> = { new(): IPushDownAutomaton<T> };
export default IPushDownAutomaton;
