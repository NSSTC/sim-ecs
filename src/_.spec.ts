export type TTypeProto<T> = new (...args: any[]) => T;
export type TObjectProto = TTypeProto<Object>;
