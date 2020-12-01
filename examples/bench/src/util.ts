import {IBenchmarkConstructor} from "./benchmark.spec";
import {add} from "benny";

export const testImplementations = (iterCount: number, ...cases: [string, IBenchmarkConstructor][]) =>
    cases.map(([name, Benchmark]) => {
        return add(name, async () => {
            const bench = new Benchmark(iterCount);

            await bench.init();
            await bench.burnIn();

            return () => bench.run();
        });
    });
