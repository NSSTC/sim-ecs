import {suites} from "./suites";
import {IBenchmarkConstructor, ISuiteResult} from "./benchmark.spec";
import {scheduleBenchmarks, serializeBenchmarks, simpleInsertBenchmarks, simpleIterBenchmarks} from "./libraries";

(async () => {
    const iterCount = 1000;
    const probeCount = 50;

    const libBenches: { name: string, bench: IBenchmarkConstructor[] }[] = [
        //{ name: 'Simple Insert', bench: simpleInsertBenchmarks },
        { name: 'Simple Iter', bench: simpleIterBenchmarks },
        //{ name: 'Schedule', bench: scheduleBenchmarks },
        //{ name: 'Serialize', bench: serializeBenchmarks },
    ];

    for (const libBench of libBenches) {
        for (const suite of suites) {
            let lastResult: ISuiteResult;

            console.log('\n', suite.name, '/', libBench.name);
            console.log('--------------------------------');

            await suite.init(libBench.bench, iterCount, probeCount);

            for await (const result of suite.run()) {
                const bench = result.currentResult;

                lastResult = result;

                // see https://calculator.academy/percentage-difference-calculator/
                const deviations = [
                    Math.abs( bench.slowestTime - bench.averageTime ) / ((bench.slowestTime + bench.averageTime) / 2),
                    Math.abs( bench.fastestTime - bench.averageTime ) / ((bench.slowestTime + bench.averageTime) / 2),
                ];

                //console.log(JSON.stringify(bench));
                console.log('   ', bench.name, Math.round(1 / (bench.averageTime / 1000)), 'ops/s ±', Math.max.apply(Math, deviations).toPrecision(2).toString() + '%')
            }

            await suite.reset();
            console.log('\n');
        }
    }
})();
