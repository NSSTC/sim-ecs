import {readFileSync} from "fs-extra";
import {arch, cpus, release, platform, type} from 'os';

const nodeVersion = process.version;

const benchVersion = JSON.parse(readFileSync('package.json').toString()).version;
const tsVersion = JSON.parse(readFileSync('node_modules/typescript/package.json').toString()).version;
const tsLibVersion = JSON.parse(readFileSync('node_modules/tslib/package.json').toString()).version;
const tsxVersion = JSON.parse(readFileSync('node_modules/tsx/package.json').toString()).version;

const apeVersion = JSON.parse(readFileSync('node_modules/ape-ecs/package.json').toString()).version;
const bitVersion = JSON.parse(readFileSync('node_modules/bitecs/package.json').toString()).version;
const javelinVersion = JSON.parse(readFileSync('node_modules/@javelin/ecs/package.json').toString()).version;
const simVersion = JSON.parse(readFileSync('../../package.json').toString()).version;
const tickKnockVersion = JSON.parse(readFileSync('node_modules/tick-knock/package.json').toString()).version;

const getUniqueCPUs = () => cpus()
    .filter((cpu, i, cpus) =>
        !cpus.find((c, j) => j < i && cpu.model == c.model)
    );
const now = new Date();
const date = now.getDate().toString();
const dateCounter = date.endsWith('1')
    ? 'st'
    : date.endsWith('2')
        ? 'nd'
        : date.endsWith('3')
            ? 'rd'
            : 'th';
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

console.log(`
--------------------------------------------------------------------------------
TypeScript ECS Bench
--------------------------------------------------------------------------------

${date}${dateCounter} ${months[now.getMonth()]} ${now.getFullYear()}

Platform: ${type()} ${platform()} ${arch()} v${release()}
CPU: ${getUniqueCPUs().map(cpu => `${cpu.model.trim()}@${cpu.speed}MHz`).join(', ')}
NodeJS: ${nodeVersion}

Bench\t\tv${benchVersion}
TypeScript\tv${tsVersion}
TS-Lib\t\tv${tsLibVersion}
TSX\t\tv${tsxVersion}

Ape-ECS\t\tv${apeVersion}
bitecs\t\tv${bitVersion}
Javelin\t\tv${javelinVersion}
sim-ecs\t\tv${simVersion}
tick-knock\tv${tickKnockVersion}

Measured in "points" for comparison. More is better!
`);


import './benchmark';
