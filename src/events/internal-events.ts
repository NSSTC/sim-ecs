import type {ISystem} from "../system/system.spec.ts";
import type {TObjectProto} from "../_.spec.ts";
import type {IState} from "../state/state.spec.ts";
import type {IEntity} from "../entity/entity.spec.ts";


export class SimECSEvent {}

class SimECSEntityEvent extends SimECSEvent {
    constructor(
        public readonly entity: Readonly<IEntity>,
    ) { super() }
}

export class SimECSEntityAddEvent extends SimECSEntityEvent {}
export class SimECSEntityRemoveEvent extends SimECSEntityEvent {}

class SimECSPDAEvent extends SimECSEvent {
    constructor(
        public readonly state: Readonly<IState> | undefined,
    ) { super() }
}

export class SimECSPDAPopStateEvent extends SimECSPDAEvent {
    constructor(
        public readonly oldState: Readonly<IState> | undefined,
        public readonly newState: Readonly<IState> | undefined,
    ) {
        super(newState);
    }
}

export class SimECSPDAPushStateEvent extends SimECSPDAEvent {
    constructor(
        public readonly oldState: Readonly<IState> | undefined,
        public readonly newState: Readonly<IState>,
    ) {
        super(newState);
    }
}


class SimECSResourceEvent<T extends TObjectProto> extends SimECSEvent {
    constructor(
        public resourceType: T,
        public resourceObject: InstanceType<T>,
    ) { super() }
}

export class SimECSAddResourceEvent<T extends TObjectProto> extends SimECSResourceEvent<T> {}
export class SimECSReplaceResourceEvent<T extends TObjectProto> extends SimECSResourceEvent<T> {}


class SimECSSystemResourceEvent extends SimECSEvent{
    constructor(
        public readonly system: Readonly<ISystem>,
        public readonly paramName: string,
        public readonly resource: Readonly<TObjectProto>,
    ) { super() }
}

export class SimECSSystemAddResource extends SimECSSystemResourceEvent {}
export class SimECSSystemReplaceResource extends SimECSSystemResourceEvent {}
