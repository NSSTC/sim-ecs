import * as ApeECS from "./_ape-ecs";
import * as BitECS from "./_bitecs";
import * as SimECS from "./_sim-ecs";
import * as TickKnock from "./_tick-knock";
import {IBenchmarkConstructor} from "../benchmark.spec";


export const scheduleBenchmarks: IBenchmarkConstructor[] = [
    //ApeECS.Schedule,
    //BitECS.Schedule,
    //SimECS.Schedule,
    //TickKnock.Schedule,
];

export const serializeBenchmarks: IBenchmarkConstructor[] = [
    ApeECS.SerializeSave,
    SimECS.SerializeSave,
];

export const simpleInsertBenchmarks: IBenchmarkConstructor[] = [
    ApeECS.SimpleInsert,
    BitECS.SimpleInsert,
    SimECS.SimpleInsert,
    TickKnock.SimpleInsert,
];

export const simpleIterBenchmarks: IBenchmarkConstructor[] = [
    ApeECS.SimpleIter,
    BitECS.SimpleIter,
    SimECS.SimpleIter,
    TickKnock.SimpleIter,
];
