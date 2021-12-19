export type TTypeProto<T> = new (...args: any[]) => T;
export type TObjectProto = TTypeProto<Object>;

export type TExecutor = () => void | Promise<void>;
