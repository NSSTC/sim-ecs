import {readFileSync} from "fs-extra";
import {arch, cpus, release, platform, type} from 'os';

const benchVersion = JSON.parse(readFileSync('package.json').toString()).version;
const tsVersion = JSON.parse(readFileSync('node_modules/typescript/package.json').toString()).version;
const tsLibVersion = JSON.parse(readFileSync('node_modules/tslib/package.json').toString()).version;
const tsNodeVersion = JSON.parse(readFileSync('node_modules/ts-node/package.json').toString()).version;

const apeVersion = JSON.parse(readFileSync('node_modules/ape-ecs/package.json').toString()).version;
const bitVersion = JSON.parse(readFileSync('node_modules/bitecs/package.json').toString()).version;
const simVersion = JSON.parse(readFileSync('../../package.json').toString()).version;
const tickKnockVersion = JSON.parse(readFileSync('node_modules/tick-knock/package.json').toString()).version;

const getUniqueCPUs = () => cpus()
    .filter((cpu, i, cpus) =>
        !cpus.find((c, j) => j < i && cpu.model == c.model)
    );

console.log(`
--------------------------------------------------------------------------------
TypeScript ECS Bench
--------------------------------------------------------------------------------

Platform: ${type()} ${platform()} ${arch()} v${release()}
CPU: ${getUniqueCPUs().map(cpu => `${cpu.model.trim()}@${cpu.speed}MHz`).join(', ')}

Bench\t\tv${benchVersion}
TypeScript\tv${tsVersion}
TS-Lib\t\tv${tsLibVersion}
TS-Node\t\tv${tsNodeVersion}

Ape-ECS\t\tv${apeVersion}
bitecs\t\tv${bitVersion}
sim-ecs\t\tv${simVersion}
tick-knock\tv${tickKnockVersion}
`);


import './benchmark';
