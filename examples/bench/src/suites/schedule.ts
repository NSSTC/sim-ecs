import {complete, cycle, suite} from 'benny';
import {Schedule as ApeECS} from '../_ape-ecs';
import {Schedule as SimECS} from '../_sim-ecs';
import {Schedule as TickKnock} from '../_tick-knock';
import {testImplementations} from "../util";

export const iterCount = 1000;

export const bench = () => new Promise((resolve, reject) => {
    setTimeout(async () => {
        suite(`Schedule (${iterCount} iterations)`,
            ...testImplementations(iterCount,
                ['ape-ecs', ApeECS],
                ['sim-ecs', SimECS],
                ['tick-knock', TickKnock],
            ),
            cycle(),
            complete(),
        ).catch(reject).then(resolve);
    });
});
