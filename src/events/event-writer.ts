import type {IEventBus} from "./event-bus.spec";
import type {IEventWriter} from "./event-writer.spec";
import type {TObjectProto} from "../_.spec";

export class EventWriter<T extends TObjectProto> implements IEventWriter<T>{
    constructor(
        protected bus: IEventBus
    ) {}

    publish(event: InstanceType<T>): Promise<void> {
        return this.bus.publish(event);
    }
}
