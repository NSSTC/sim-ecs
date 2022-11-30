import type {IEventBus} from "./event-bus.spec";
import type {TObjectProto} from "../_.spec";
import type {IEventReader} from "./event-reader.spec";
import type {IEventWriter} from "./event-writer.spec";
import {EventReader} from "./event-reader";
import {EventWriter} from "./event-writer";
import type {TSubscriber} from "./_";

export class EventBus implements IEventBus {
    protected subscribers = new Map<TObjectProto, Set<TSubscriber<TObjectProto>>>();

    createReader<T extends TObjectProto>(Event: T): IEventReader<T> {
        return new EventReader(this, Event);
    }

    createWriter<T extends TObjectProto>(): IEventWriter<T> {
        return new EventWriter(this);
    }

    async publish(event: object): Promise<void> {
        const subscribers = this.subscribers.get(event.constructor as TObjectProto) ?? [];
        let handler;

        for (handler of subscribers.values()) {
            await handler(event);
        }
    }

    subscribe<T extends TObjectProto>(Event: T, handler: TSubscriber<T>): void {
        let subscriberList = this.subscribers.get(Event);

        if (!subscriberList) {
            subscriberList = new Set();
            this.subscribers.set(Event, subscriberList);
        }

        subscriberList.add(handler);
    }

    subscribeReader<T extends TObjectProto>(reader: IEventReader<T>) {
        this.subscribe(reader.eventType, reader.eventHandler);
    }

    unsubscribe<T extends TObjectProto>(Event: T, handler: TSubscriber<T>): void {
        let subscriberList = this.subscribers.get(Event);

        if (!subscriberList) {
            subscriberList = new Set();
            this.subscribers.set(Event, subscriberList);
        }

        subscriberList.delete(handler);
    }

    unsubscribeReader<T extends TObjectProto>(reader: EventReader<T>): void {
        this.unsubscribe(reader.eventType, reader.eventHandler);
    }
}
