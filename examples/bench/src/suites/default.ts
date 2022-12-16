import {ISuite} from "../suite.spec";
import {IBenchmark, IBenchmarkConstructor, ISuiteResult, ISuiteResults} from "../benchmark.spec";

const defaultSuite = {
    benchmarks: [] as IBenchmark[],
    name: 'Default Suite',
    probeCount: 0,

    init(libBenches: IBenchmarkConstructor[], iterCount: number, probeCount: number) {
        this.probeCount = probeCount;
        this.benchmarks.length = 0;

        libBenches.forEach(Benchmark => {
            this.benchmarks.push(new Benchmark(iterCount));
        });
    },

    async reset() {
        for (const bench of this.benchmarks) {
            await bench.reset();
        }
    },

    async *run(): AsyncIterableIterator<ISuiteResult> {
        const results: ISuiteResults = {};

        for (const bench of this.benchmarks) {
            const runTimes: number[] = [];

            await bench.init();

            // burn-in
            for (let i = 0; i < 1000; i++) {
                await bench.run();
                await bench.reset();
            }

            for (let i = 0; i < this.probeCount; i++) {
                const start = process.hrtime.bigint();
                await bench.run();
                runTimes.push(Number(process.hrtime.bigint() - start) / 1000000);
                await bench.reset();
            }

            const totalTime = runTimes.reduce((acc, val) => acc + val, 0);
            results[bench.name] = {
                name: bench.name,
                comment: bench.comment ?? '',
                averageTime: totalTime / runTimes.length,
                fastestTime: Math.min.apply(Math, runTimes),
                slowestTime: Math.max.apply(Math, runTimes),
                totalTime,
            };

            yield {
                name: this.name,
                currentResult: results[bench.name],
                results,
            } as ISuiteResult;
        }
    }
};

export const suite: ISuite = defaultSuite;
