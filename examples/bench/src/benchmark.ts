import {suites} from "./suites";
import {IBenchmarkConstructor, ISuiteResult} from "./benchmark.spec";
import {scheduleBenchmarks, serializeBenchmarks, simpleInsertBenchmarks, simpleIterBenchmarks} from "./libraries";

interface IBenchDesc {
    name: string,
    bench: IBenchmarkConstructor[]
    iterCount: number
    probeCount: number
}

(async () => {
    const libBenches: IBenchDesc[] = [
        { name: 'Simple Insert', bench: simpleInsertBenchmarks, iterCount: 100, probeCount: 50 },
        { name: 'Simple Iter', bench: simpleIterBenchmarks, iterCount: 5, probeCount: 10 },
        { name: 'Schedule', bench: scheduleBenchmarks, iterCount: 5, probeCount: 10 },
        { name: 'Serialize', bench: serializeBenchmarks, iterCount: 100, probeCount: 50 },
    ];

    for (const libBench of libBenches) {
        for (const suite of suites) {
            let lastResult: ISuiteResult;

            console.log('\n', `**${suite.name} / ${libBench.name}**`);
            console.log(
                '\n| Library | Points | Deviation | Comment |',
                '\n|    ---: |   ---: | :---      | :---    |',
            );

            await suite.init(libBench.bench, libBench.iterCount, libBench.probeCount);

            for await (const result of suite.run()) {
                const bench = result.currentResult;

                lastResult = result;

                // see https://calculator.academy/percentage-difference-calculator/
                const deviations = [
                    Math.abs( bench.slowestTime - bench.averageTime ) / ((bench.slowestTime + bench.averageTime) / 2),
                    Math.abs( bench.fastestTime - bench.averageTime ) / ((bench.slowestTime + bench.averageTime) / 2),
                ];

                console.log(
                    '|', bench.name,
                    '|', Math.round(1 / (bench.averageTime / 1000)),
                    '|', '±', Math.max.apply(Math, deviations).toPrecision(2).toString() + '%',
                    '|', bench.comment,
                    '|',
                )
            }

            await suite.reset();
            console.log('\n');
        }
    }
})();
