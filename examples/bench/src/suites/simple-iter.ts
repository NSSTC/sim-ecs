import {complete, cycle, suite} from 'benny';
import {SimpleIter as ApeECS} from '../_ape-ecs';
import {SimpleIter as SimECS} from '../_sim-ecs';
import {SimpleIter as TickKnock} from '../_tick-knock';
import {testImplementations} from "../util";

export const iterCount = 100000;

export const bench = () => new Promise((resolve, reject) => {
    setTimeout(async () => {
        suite(`Simple Iter (${iterCount} iterations)`,
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
