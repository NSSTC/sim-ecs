import {complete, cycle, suite} from 'benny';
import {SimpleIter as ApeECS} from '../_ape-ecs';
import {SimpleIter as SimECS} from '../_sim-ecs';
import {SimpleIter_CB as SimECS_CB} from '../_sim-ecs';
import {SimpleIter as TickKnock} from '../_tick-knock';
import {testImplementations} from "../util";

export const iterCounts = [1000];

export const bench = async () => {
    const doBench = async (iterCount: number) => {
        await suite(`Simple Iter (${iterCount} iterations)`,
            ...testImplementations(iterCount,
                ['ape-ecs', ApeECS],
                ['sim-ecs', SimECS],
                ['sim-ecs CB', SimECS_CB],
                ['tick-knock', TickKnock],
            ),
            cycle(),
            complete(),
        );
    };

    for (const iterCount of iterCounts) {
        await doBench(iterCount);
    }
};
