export interface IBenchmark {
    readonly name: string
    comment?: string

    init(): Promise<void> | void
    reset(): Promise<void> | void
    run(): Promise<void> | void
}

export interface IBenchmarkConstructor {
    new(iterCount: number): IBenchmark
}

export interface ICaseResult {
    readonly name: string

    averageTime: number
    fastestTime: number
    slowestTime: number
    totalTime: number
    comment: string
}

export interface ISuiteResult {
    readonly name: string

    currentResult: ICaseResult
    results: ISuiteResults
}

export interface ISuiteResults {
    [caseName: string]: ICaseResult
}
