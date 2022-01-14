import {IEventBus, TSubscriber} from "./event-bus.spec";
import {TObjectProto} from "../_.spec";
import {IEventReader} from "./event-reader.spec";
import {IEventWriter} from "./event-writer.spec";
import {EventReader} from "./event-reader";
import {EventWriter} from "./event-writer";

export class EventBus implements IEventBus {
    protected subscribers = new Map<TObjectProto, Set<TSubscriber<TObjectProto>>>();

    createReader<T extends TObjectProto>(Event: T): IEventReader<T> {
        return new EventReader(this, Event);
    }

    createWriter<T extends TObjectProto>(): IEventWriter<T> {
        return new EventWriter(this);
    }

    async publish(event: Object): Promise<void> {
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

    unsubscribe<T extends TObjectProto>(Event: T, handler: TSubscriber<T>): void {
        let subscriberList = this.subscribers.get(Event);

        if (!subscriberList) {
            subscriberList = new Set();
            this.subscribers.set(Event, subscriberList);
        }

        subscriberList.delete(handler);
    }
}
