export type TTypeProto<T> = (new (...args: any[]) => T) & Function;
export type TObjectProto = TTypeProto<object>;

export type TExecutor = () => void | Promise<void>;
