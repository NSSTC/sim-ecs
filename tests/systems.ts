import {System} from "..";
import {SystemData, Write} from "../src/system";
import {C1, C2} from "./components";
import {ISystemActions} from "../src";

export class S1Data extends SystemData{ c1 = Write(C1) }
export type THandlerFn1 = (data: S1Data) => void
export class S1 extends System<S1Data> {
    readonly SystemDataType = S1Data;
    handler: THandlerFn1;

    constructor(handler: THandlerFn1) {
        super();
        this.handler = handler;
    }

    async update(actions: ISystemActions, dataSet: Set<S1Data>): Promise<void> {
        for(const entry of dataSet) this.handler(entry);
    }
}

export class S2Data extends SystemData{}
export type THandlerFn2 = (data: Set<S2Data>) => void
export class S2 extends System<S2Data> {
    readonly SystemDataType = S2Data;
    handler: THandlerFn2;

    constructor(handler: THandlerFn2) {
        super();
        this.handler = handler;
    }

    async update(actions: ISystemActions, dataSet: Set<S2Data>): Promise<void> {
        this.handler(dataSet);
    }
}
