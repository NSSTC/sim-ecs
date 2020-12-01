import {complete, cycle, suite} from 'benny';
import {SerializeSave as ApeECS} from '../_ape-ecs';
import {SerializeSave as SimECS} from '../_sim-ecs';
import {testImplementations} from "../util";

export const iterCount = 1;

export const bench = () => new Promise((resolve, reject) => {
    setTimeout(async () => {
        suite(`Serialize Save`,
            ...testImplementations(iterCount,
                ['ape-ecs', ApeECS],
                ['sim-ecs', SimECS],
            ),
            cycle(),
            complete(),
        ).catch(reject).then(resolve);
    });
});
