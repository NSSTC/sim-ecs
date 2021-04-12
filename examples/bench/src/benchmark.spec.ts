export interface IBenchmarkConstructor {
    new(iterCount: number): IBenchmark
}

export interface IBenchmark {
    burnIn(): IBenchmark | Promise<IBenchmark>
    cleanUp(): IBenchmark
    init(): Promise<void>
    run(): void | Promise<void>
}

export abstract class ABenchmark implements IBenchmark {
    async burnIn(): Promise<IBenchmark> {
        await this.run();
        this.cleanUp();
        return this;
    }

    abstract cleanUp(): IBenchmark;

    async init(): Promise<void> {}

    abstract run(): void | Promise<void>;
}

export type TBenchProto = new (...args: any[]) => IBenchmark;
