import type {IEventBus} from "./event-bus.spec.ts";
import type {TObjectProto} from "../_.spec.ts";
import type {IEventReader} from "./event-reader.spec.ts";
import {EventReader} from "./event-reader.ts";
import {EventWriter} from "./event-writer.ts";
import type {TSubscriber} from "./_.ts";

export * from "./event-bus.spec.ts";

export class EventBus implements IEventBus {
    protected subscribers = new Map<Readonly<TObjectProto>, Set<TSubscriber<TObjectProto>>>();

    createReader<T extends TObjectProto>(Event: Readonly<T>): EventReader<T> {
        return new EventReader(this, Event);
    }

    createWriter<T extends TObjectProto>(): EventWriter<T> {
        return new EventWriter(this);
    }

    async publish(event: Readonly<object>): Promise<void> {
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

    subscribeReader<T extends TObjectProto>(reader: Readonly<IEventReader<T>>): void {
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

    unsubscribeReader<T extends TObjectProto>(reader: Readonly<EventReader<T>>): void {
        this.unsubscribe(reader.eventType, reader.eventHandler);
    }
}
