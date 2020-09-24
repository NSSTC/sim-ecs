import {System} from "../..";
import {NoData, SystemData} from "../system";
import {C1} from "./components";
import {Write} from "../queue.spec";

export class S1Data extends SystemData{ c1 = Write(C1) }
export type THandlerFn1 = (data: S1Data) => void
export class S1 extends System<S1Data> {
    readonly SystemDataType = S1Data;
    handler: THandlerFn1;

    constructor(handler: THandlerFn1) {
        super();
        this.handler = handler;
    }

    async run(dataSet: Set<S1Data>): Promise<void> {
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

    async run(dataSet: Set<S2Data>): Promise<void> {
        this.handler(dataSet);
    }
}

export type THandlerFn3 = (data: Set<NoData>) => void
export class NoDataSystem extends System<NoData> {
    readonly SystemDataType = NoData;
    handler: THandlerFn3;

    constructor(handler: THandlerFn3) {
        super();
        this.handler = handler;
    }

    async run(dataSet: Set<NoData>): Promise<void> {
        this.handler(dataSet);
    }

}
