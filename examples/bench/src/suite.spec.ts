import {IBenchmarkConstructor, ISuiteResult} from "./benchmark.spec";

export interface ISuite {
    readonly name: string

    init(libBenches: IBenchmarkConstructor[], iterCount: number, probeCount: number): Promise<void> | void
    reset(): Promise<void> | void
    run(): AsyncIterableIterator<ISuiteResult>
}
