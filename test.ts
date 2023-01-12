const numOfEntities = 10000000 as const;
const typedArrSizeMultiplicator = 1.5 as const;
const defaultX = 1.1 as const;
const defaultY = 0.1 as const;

class Vector {
    constructor(
        public x: number = defaultX,
        public y: number = defaultY,
    ) {}
}

class Position extends Vector {
}

class Velocity extends Vector {
}

interface IDATA {
    pos: Position
    vel: Velocity
}

function system({pos, vel}: IDATA) {
    pos.x += vel.x;
    pos.y += vel.y;
}

class Archetypes {
    pos = {
        x: new Float32Array(numOfEntities * typedArrSizeMultiplicator),
        y: new Float32Array(numOfEntities * typedArrSizeMultiplicator),
    }
    vel = {
        x: new Float32Array(numOfEntities * typedArrSizeMultiplicator),
        y: new Float32Array(numOfEntities * typedArrSizeMultiplicator),
    }
}

const arrOfStruct: Array<IDATA> = [];
const structOfArr: Archetypes = new Archetypes();


for (let i = 0; i < numOfEntities; i++) {
    arrOfStruct.push({
        pos: new Position(),
        vel: new Velocity(),
    });
}

structOfArr.pos.x.fill(defaultX, 0, numOfEntities - 1);
structOfArr.pos.y.fill(defaultY, 0, numOfEntities - 1);
structOfArr.vel.x.fill(defaultX, 0, numOfEntities - 1);
structOfArr.vel.y.fill(defaultY, 0, numOfEntities - 1);


let data: Record<string, any>;
let start;
let end;

start = process.hrtime.bigint();
for (data of arrOfStruct) {
    system(data as IDATA);
}
end = process.hrtime.bigint();
console.log('AoS time:', Number(end - start) / 1000000);


start = process.hrtime.bigint();
let componentDataStructName, componentProps: Record<string, Float32Array>;
let component: Record<string, any>;
let componentPropName, componentPropValues : Float32Array;
data = {};

for (let i = 0; i < numOfEntities; i++) {
    for ([componentDataStructName, componentProps] of Object.entries(structOfArr)) {
        component = {};
        for ([componentPropName, componentPropValues] of Object.entries(componentProps)) {
            component[componentPropName] = componentPropValues[i];
        }

        data[componentDataStructName] = component;
    }

    system(data as IDATA);
}

end = process.hrtime.bigint();
console.log('SoA time:', Number(end - start) / 1000000);
