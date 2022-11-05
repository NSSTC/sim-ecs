import type {IWorld} from "./world.spec";
import type {IIStateProto, IState} from "../state/state.spec";
import type {ICommands} from "./runtime/commands/commands.spec";
import type {IEntity} from "../entity/entity.spec";
import type {TTypeProto} from "../_.spec";

export interface ITransitionActions extends Readonly<IWorld> {
    currentState: IState | undefined

    flushCommands(): Promise<void>
    popState(): Promise<void>
    pushState(NewState: IIStateProto): Promise<void>
}

export interface ISystemActions {
    commands: ICommands
    currentState: IState | undefined

    getEntities(): IterableIterator<IEntity>
    getResource<T extends Object>(type: TTypeProto<T>): T
    hasResource<T extends Object>(type: T | TTypeProto<T>): boolean
}
