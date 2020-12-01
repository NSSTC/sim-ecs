import {complete, cycle, suite} from 'benny';
import {SimpleInsert as ApeECS} from '../_ape-ecs';
import {SimpleInsert as SimECS} from '../_sim-ecs';
import {SimpleInsert as TickKnock} from '../_tick-knock';
import {testImplementations} from "../util";

export const iterCount = 1000;

export const bench = () => new Promise((resolve, reject) => {
    setTimeout(async () => {
        suite(`Simple Insert (${iterCount} iterations)`,
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
