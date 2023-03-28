import type {IEventBus} from "./event-bus.spec.ts";
import type {IEventWriter} from "./event-writer.spec.ts";
import type {TObjectProto} from "../_.spec.ts";

export * from "./event-writer.spec.ts";

export class EventWriter<T extends TObjectProto> implements IEventWriter<T>{
    constructor(
        protected bus: IEventBus
    ) {}

    publish(event: Readonly<InstanceType<T>>): Promise<void> {
        return this.bus.publish(event);
    }
}
