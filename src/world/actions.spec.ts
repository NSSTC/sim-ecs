import type {IIStateProto, IState} from "../state/state.spec.ts";
import type {ICommands} from "./runtime/commands/commands.spec.ts";
import type {TTypeProto} from "../_.spec.ts";
import type {IEntitiesQuery} from "../query/query.spec.ts";
import type {ISerDeOptions, TSerializer} from "../serde/serde.spec.ts";
import type {ISerialFormat} from "../serde/serial-format.spec.ts";
import type {IEventBus} from "../events/event-bus.spec.ts";
import type {IReadOnlyEntity} from "../entity/entity.spec.ts";

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
