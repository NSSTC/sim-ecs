export type TTypeProto<T> = new (...args: any[]) => T;
export type TObjectProto = TTypeProto<object>;

export type TExecutor = () => void | Promise<void>;
