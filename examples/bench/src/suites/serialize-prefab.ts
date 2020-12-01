import {complete, cycle, suite} from 'benny';
import {SerializePrefab as ApeECS} from '../_ape-ecs';
import {SerializePrefab as SimECS} from '../_sim-ecs';
import {testImplementations} from "../util";

export const iterCount = 1;

export const bench = () => new Promise((resolve, reject) => {
    setTimeout(async () => {
        suite(`Serialize Prefab`,
            ...testImplementations(iterCount,
                ['ape-ecs', ApeECS],
                ['sim-ecs', SimECS],
            ),
            cycle(),
            complete(),
        ).catch(reject).then(resolve);
    });
});
