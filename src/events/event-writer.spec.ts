import {TObjectProto} from "../_.spec";

export interface IEventWriter<T extends TObjectProto> {
    publish(event: InstanceType<T>): void
}
