import {ISystemWorld, System} from "..";
import {SystemData, Write} from "../src/system";
import {C1, C2} from "./components";

export class S1Data extends SystemData{ c1 = Write(C1) }
export type THandlerFn1 = (data: S1Data) => void
export class S1 extends System<S1Data> {
    readonly SystemData = S1Data;
    handler: THandlerFn1;

    constructor(handler: THandlerFn1) {
        super();
        this.handler = handler;
    }

    async update(world: ISystemWorld, dataSet: Set<S1Data>): Promise<void> {
        for(const entry of dataSet) this.handler(entry);
    }
}

export class S2Data extends SystemData{ c2 = Write(C2) }
export type THandlerFn2 = (data: S2Data) => void
export class S2 extends System<S2Data> {
    readonly SystemData = S2Data;
    handler: THandlerFn2;

    constructor(handler: THandlerFn2) {
        super();
        this.handler = handler;
    }

    async update(world: ISystemWorld, dataSet: Set<S2Data>): Promise<void> {
        for(const entry of dataSet) this.handler(entry);
    }
}

export class S3Data extends SystemData{ c1 = Write(C1); c2 = Write(C2) }
export type THandlerFn3 = (data: S3Data) => void
export class S3 extends System<S3Data> {
    readonly SystemData = S3Data;
    handler: THandlerFn3;

    constructor(handler: THandlerFn3) {
        super();
        this.handler = handler;
    }

    async update(world: ISystemWorld, dataSet: Set<S3Data>): Promise<void> {
        for(const entry of dataSet) this.handler(entry);
    }
}
