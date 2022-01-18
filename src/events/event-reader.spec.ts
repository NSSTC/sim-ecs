import {TObjectProto} from "../_.spec";
import {TSubscriber} from "./_";

export interface IEventReader<T extends TObjectProto> {
    readonly eventHandler: TSubscriber<T>
    readonly eventType: T

    execute(handler: (event: InstanceType<T>) => void | Promise<void>): Promise<void>
    getOne(): InstanceType<T> | undefined
    iter(): IterableIterator<InstanceType<T>>
}
