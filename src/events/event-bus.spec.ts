import {TObjectProto} from "../_.spec";
import {IEventReader} from "./event-reader.spec";
import {IEventWriter} from "./event-writer.spec";
import {TSubscriber} from "./_";

export interface IEventBus {
    createReader<T extends TObjectProto>(Event: T): IEventReader<T>
    createWriter<T extends TObjectProto>(): IEventWriter<T>
    publish(event: Object): Promise<void>
    subscribe<T extends TObjectProto>(Event: T, handler: TSubscriber<T>): void
    subscribeReader<T extends TObjectProto>(reader: IEventReader<T>): void
    unsubscribe<T extends TObjectProto>(Event: T, handler: TSubscriber<T>): void
    unsubscribeReader<T extends TObjectProto>(reader: IEventReader<T>): void
}
