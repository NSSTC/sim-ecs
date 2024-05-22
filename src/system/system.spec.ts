import type {
    IAccessQuery,
    IComponentsQueryDescriptor,
    IEntitiesQueryDescriptor
} from "../query/query.spec.ts";
import type {TObjectProto, TTypeProto} from "../_.spec.ts";
import type {ISystemActions} from "../world/actions.spec.ts";
import {systemEventReaderSym, systemEventWriterSym, systemResourceTypeSym, systemRunParamSym} from "./_.ts";
import type {IEventReader} from "../events/event-reader.spec.ts";
import type {IEventWriter} from "../events/event-writer.spec.ts";
import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec.ts";

export type TSystemParameter =
    IEntitiesQueryDescriptor
    | IEventReader<TObjectProto>
    | IComponentsQueryDescriptor<IAccessQuery<TObjectProto>>
    | ISystemActions
    | ISystemResource<TObjectProto>
    | ISystemStorage;
export type TSystemParameterDesc = { [name: string]: TSystemParameter };
export type TSystemFunction<PDESC extends TSystemParameterDesc> = (params: Readonly<PDESC>) => void | Promise<void>;

export interface ISystem<PDESC extends TSystemParameterDesc = TSystemParameterDesc> {
    /** @internal */
    [systemRunParamSym]?: Readonly<PDESC>

    readonly name: string
    readonly parameterDesc: PDESC
    readonly runFunction: TSystemFunction<Readonly<PDESC>>
    readonly runtimeContext: IRuntimeWorld | undefined
    readonly setupFunction: TSystemFunction<Readonly<PDESC>>

    /**
     * Set world in which the System will be executed.
     * This will be used to register event readers for speedy cache-syncs
     *
     * @internal
     * @param world
     */
    setRuntimeContext(world: IRuntimeWorld): void

    /**
     * Unset the world in which the system was executed.
     *
     * @internal
     */
    unsetRuntimeContext(world: IRuntimeWorld): void
}

export interface ISystemResource<T extends object> {
    /** @internal */
    [systemResourceTypeSym]: TTypeProto<T>
}

interface ISystemStorage {}

export const Actions: ISystemActions = { [Symbol()]: undefined } as unknown as Readonly<ISystemActions>;

export function ReadEvents<T extends TObjectProto>(type: T | ErrorConstructor): Readonly<IEventReader<T>> {
    return {
        [systemEventReaderSym]: type,
    } as unknown as IEventReader<T>;
}

export function ReadResource<T extends object>(type: TTypeProto<T>): ISystemResource<T> & T {
    return {
        [systemResourceTypeSym]: type,
    } as ISystemResource<T> & Readonly<T>;
}

export function Storage<T>(initializer: T): ISystemStorage & T {
    return initializer as ISystemStorage & T;
}

export function WriteEvents<T extends TObjectProto>(type: T): Readonly<IEventWriter<T>> {
    return {
        [systemEventWriterSym]: type,
    } as unknown as IEventWriter<T>;
}

export function WriteResource<T extends object>(type: TTypeProto<T>): ISystemResource<T> & T {
    return {
        [systemResourceTypeSym]: type,
    } as ISystemResource<T> & T;
}
