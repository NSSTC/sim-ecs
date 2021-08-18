import {System} from "../system";
import {C1} from "./components";
import {Query, Write} from "../query";

export class S1 extends System {
    readonly query = new Query({ c1: Write(C1) });

    constructor(public handler?: (data: { c1: C1 }) => void) {
        super();
    }

    run() {
        this.query.execute(entry => this.handler?.(entry));
    }
}

export class S2 extends System {
    constructor(public handler?: () => void) {
        super();
    }

    run() {
        this.handler?.();
    }
}
