import {TObjectProto} from "../_.spec";

export interface IEventBus {
    publish(event: Object): void
    subscribe<T extends TObjectProto>(Event: T, handler: (event: InstanceType<T>) => void): void
    unsubscribe(Event: TObjectProto): void
}
