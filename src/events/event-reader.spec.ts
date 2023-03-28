import type {TObjectProto} from "../_.spec.ts";
import type {TSubscriber} from "./_.ts";

export interface IEventReader<T extends TObjectProto> {
    readonly eventHandler: TSubscriber<T>
    readonly eventType: Readonly<T>

    execute(handler: (event: Readonly<InstanceType<T>>) => void | Promise<void>): Promise<void>
    getOne(): Readonly<InstanceType<T>> | undefined
    iter(): IterableIterator<Readonly<InstanceType<T>>>
}
