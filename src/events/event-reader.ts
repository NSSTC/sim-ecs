import type {IEventReader} from "./event-reader.spec.ts";
import type {IEventBus} from "./event-bus.spec.ts";
import type {TObjectProto} from "../_.spec.ts";
import type {TSubscriber} from "./_.ts";

export * from "./event-reader.spec.ts";

export class EventReader<T extends TObjectProto> implements IEventReader<T> {
    protected _eventHandler: TSubscriber<T> = event => { this.eventCache.push(event) };
    protected eventCache: Array<Readonly<InstanceType<T>>> = [];

    constructor(
        protected bus: IEventBus,
        protected _eventType: Readonly<T>,
    ) {
        bus.subscribe(_eventType, this._eventHandler);
    }

    get eventHandler(): TSubscriber<T> {
        return this._eventHandler;
    }

    get eventType(): Readonly<T> {
        return this._eventType;
    }

    async execute(handler: (event: Readonly<InstanceType<T>>) => (void | Promise<void>)): Promise<void> {
        let event;
        for (event of this.iter()) {
            await handler(event);
        }
    }

    getOne(): Readonly<InstanceType<T>> | undefined {
        return this.eventCache.shift();
    }

    iter(): IterableIterator<Readonly<InstanceType<T>>> {
        const events = Array.from(this.eventCache);
        this.eventCache.length = 0;
        return events.values();
    }
}
