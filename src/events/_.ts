import type {TObjectProto} from "../_.spec.ts";

export type TSubscriber<T extends TObjectProto> = (event: Readonly<InstanceType<T>>) => Promise<void> | void;
