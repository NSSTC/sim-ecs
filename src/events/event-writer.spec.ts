import type {TObjectProto} from "../_.spec.ts";

export interface IEventWriter<T extends TObjectProto> {
    publish(event: Readonly<InstanceType<T>>): Promise<void>
}
