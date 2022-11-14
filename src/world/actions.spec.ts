import type {IIStateProto, IState} from "../state/state.spec";
import type {ICommands} from "./runtime/commands/commands.spec";
import type {TTypeProto} from "../_.spec";
import type {IEntitiesQuery} from "../query/query.spec";
import type {ISerDeOptions, TSerializer} from "../serde/serde.spec";
import type {ISerialFormat} from "../serde/serial-format.spec";
import type {IEventBus} from "../events/event-bus.spec";
import {IReadOnlyEntity} from "../entity/entity.spec";

export interface ITransitionActions extends ISystemActions {
    eventBus: IEventBus

    flushCommands(): Promise<void>
    popState(): Promise<void>
    pushState(NewState: IIStateProto): Promise<void>
    save(options?: ISerDeOptions<TSerializer>): ISerialFormat
}

export interface ISystemActions {
    commands: ICommands
    currentState: IState | undefined

    getEntities(query?: IEntitiesQuery): IterableIterator<IReadOnlyEntity>
    getResource<T extends Object>(type: TTypeProto<T>): T
    hasResource<T extends Object>(type: T | TTypeProto<T>): boolean
}
