import type {TObjectProto} from "../_.spec.ts";
import type {IEventReader} from "./event-reader.spec.ts";
import type {IEventWriter} from "./event-writer.spec.ts";
import type {TSubscriber} from "./_.ts";

export * from "./_.ts";

export interface IEventBus {
    createReader<T extends TObjectProto>(Event: Readonly<T>): IEventReader<T>
    createWriter<T extends TObjectProto>(): IEventWriter<T>
    publish(event: Readonly<object>): Promise<void>
    subscribe<T extends TObjectProto>(Event: Readonly<T>, handler: TSubscriber<T>): void
    subscribeReader<T extends TObjectProto>(reader: Readonly<IEventReader<T>>): void
    unsubscribe<T extends TObjectProto>(Event: Readonly<T>, handler: TSubscriber<T>): void
    unsubscribeReader<T extends TObjectProto>(reader: Readonly<IEventReader<T>>): void
}
