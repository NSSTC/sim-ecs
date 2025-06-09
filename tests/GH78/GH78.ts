import {
    Actions,
    buildWorld,
    createSystem,
    queryComponents,
    Read,
    ReadEntity,
    ReadEvents,
    Write,
    WriteEvents,
    type ISyncPointPrefab,
} from 'sim-ecs';

class RemoveName {}
class ShowName {}
class Name {}
class Counter { count = 0 }

const CommandSystem = createSystem({
    query: queryComponents({
        counter: Write(Counter),
    }),
    show: WriteEvents(ShowName),
    remove: WriteEvents(RemoveName),
    actions: Actions,
})
    .withRunFunction(({ query, show, remove, actions }) => {
        const queryResult = query.getFirst();

        if (!queryResult) {
            return;
        }

        if (queryResult.counter.count === 0) {
            show.publish(new ShowName());
        }

        if (queryResult.counter.count === 1) {
            remove.publish(new RemoveName());
        }

        if (queryResult.counter.count === 4) {
            show.publish(new ShowName());
        }

        if (queryResult.counter.count > 4) {
            actions.commands.stopRun();
        }

        queryResult.counter.count++;
    })
    .build();

const NameSystem = createSystem({
    query: queryComponents({ name: Read(Name), entity: ReadEntity() }),
    show: ReadEvents(ShowName),
    remove: ReadEvents(RemoveName),
    actions: Actions,
})
    .withRunFunction(({ query, show, remove, actions }) => {
        if (show.getOne()) {
            console.log('Number of entities with a name:', query.resultLength);
        }

        if (remove.getOne()) {
            const q = query.getFirst();
            if (q) {
                //q.entity.removeComponent(Name);
                actions.commands.mutateEntity(q.entity, entity => { entity.removeComponent(Name) });
                //console.log(q.entity);
            }
        }
    })
    .build();

const schedule: ISyncPointPrefab = {
    stages: [[CommandSystem], [NameSystem]],
};

const prepWorld = buildWorld()
    .withDefaultScheduling(root => root.fromPrefab(schedule))
    .withComponent(Name)
    .build();

prepWorld.buildEntity().with(Counter).build();
prepWorld.buildEntity().with(Name).build();
prepWorld.buildEntity().with(Name).build();
prepWorld.buildEntity().with(Name).build();
prepWorld.buildEntity().with(Name).build();

const runWorld = await prepWorld.prepareRun();
await runWorld.start();
