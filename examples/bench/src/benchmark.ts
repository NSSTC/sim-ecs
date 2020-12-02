import {bench as scheduleBench} from "./suites/schedule";
import {bench as serializePrefab} from "./suites/serialize-prefab";
import {bench as serializeSave} from "./suites/serialize-save";
import {bench as simpleInsertBench} from "./suites/simple-insert";
import {bench as simpleIterBench} from "./suites/simple-iter";

(async () => {
    await simpleInsertBench();
    await simpleIterBench();
    await scheduleBench();
    await serializePrefab();
    await serializeSave();
})();
