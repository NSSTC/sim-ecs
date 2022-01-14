import {TObjectProto} from "../_.spec";

export interface IEventReader<T extends TObjectProto> {
    execute(handler: (event: InstanceType<T>) => void | Promise<void>): Promise<void>
    getOne(): InstanceType<T> | undefined
    iter(): IterableIterator<InstanceType<T>>
}
