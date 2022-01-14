import {IEventReader} from "./event-reader.spec";
import {IEventBus} from "./event-bus.spec";
import {TObjectProto} from "../_.spec";

export class EventReader<T extends TObjectProto> implements IEventReader<T> {
    protected eventCache: InstanceType<T>[] = [];

    constructor(
        protected bus: IEventBus,
        protected eventType: T,
    ) {
        bus.subscribe(eventType, event => {
            this.eventCache.push(event);
        });
    }

    async execute(handler: (event: InstanceType<T>) => (void | Promise<void>)): Promise<void> {
        let event;
        for (event of this.iter()) {
            await handler(event);
        }
    }

    getOne(): InstanceType<T> | undefined {
        return this.eventCache.shift();
    }

    iter(): IterableIterator<InstanceType<T>> {
        const events = Array.from(this.eventCache);
        this.eventCache.length = 0;
        return events.values();
    }
}
