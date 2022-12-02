import type {IIStateProto, IState} from "../state/state.spec";
import type {ICommands} from "./runtime/commands/commands.spec";
import type {TTypeProto} from "../_.spec";
import type {IEntitiesQuery} from "../query/query.spec";
import type {ISerDeOptions, TSerializer} from "../serde/serde.spec";
import type {ISerialFormat} from "../serde/serial-format.spec";
import type {IEventBus} from "../events/event-bus.spec";
import type {IReadOnlyEntity} from "../entity/entity.spec";

export interface ITransitionActions extends ISystemActions {
    eventBus: Readonly<IEventBus>

    flushCommands(): Promise<void>
    popState(): Promise<void>
    pushState(NewState: Readonly<IIStateProto>): Promise<void>
    save(options?: Readonly<ISerDeOptions<TSerializer>>): ISerialFormat
}

export interface ISystemActions {
    commands: Readonly<ICommands>
    currentState: Readonly<IState> | undefined

    getEntities(query?: Readonly<IEntitiesQuery>): IterableIterator<IReadOnlyEntity>
    getResource<T extends object>(type: TTypeProto<T>): T
    hasResource<T extends object>(type: Readonly<T> | TTypeProto<T>): boolean
}
