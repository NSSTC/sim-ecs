import type {ISystem} from "../system/system.spec.ts";
import type {TObjectProto} from "../_.spec.ts";
import type {IIStateProto} from "../state/state.spec.ts";


class SimECSPDAEvent {
    constructor(
        public readonly state: Readonly<IIStateProto>
    ) {}
}

export class SimECSPDAPushStateEvent extends SimECSPDAEvent {}


class SimECSResourceEvent<T extends TObjectProto> {
    constructor(
        public resourceType: T,
        public resourceObject: InstanceType<T>,
    ) {}
}

export class SimECSAddResourceEvent<T extends TObjectProto> extends SimECSResourceEvent<T> {}
export class SimECSReplaceResourceEvent<T extends TObjectProto> extends SimECSResourceEvent<T> {}


class SimECSSystemResourceEvent {
    constructor(
        public readonly system: Readonly<ISystem>,
        public readonly paramName: string,
        public readonly resource: Readonly<TObjectProto>,
    ) {}
}

export class SimECSSystemAddResource extends SimECSSystemResourceEvent {}
export class SimECSSystemReplaceResource extends SimECSSystemResourceEvent {}
