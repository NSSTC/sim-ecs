import {Read, ReadEntity, With, WithTag, Without, WithoutTag, Write} from "./query";
import {queryComponents} from "../ecs/ecs-query";
import {buildWorld} from "../ecs/ecs-world";
import {createSystem} from "../system/system";
import {Entity} from "../entity/entity";
import {assert} from "chai";

class Component {
    health = 100
}

class Marker {
    flag = true
}

const Tag = 'a-tag';

describe('Test Query', () => {
    it('pop', () => {
        const query = queryComponents({
            entity: ReadEntity(),
            testR: Read(Component),
            testW: Write(Component),
        });

        for (const {testW} of query.iter()) {
            testW.health++;
        }
    });
});

describe('Existence parameters in component queries', () => {
    async function count(descriptor: Parameters<typeof queryComponents>[0], tagged: boolean) {
        const query = queryComponents(descriptor);
        const System = createSystem({query}).withName('Probe').withRunFunction(() => {}).build();
        const prepWorld = buildWorld()
            .withDefaultScheduling(root => root.addNewStage(stage => stage.addSystem(System)))
            .withComponents(Component, Marker)
            .build();
        const runWorld = await prepWorld.prepareRun();

        const entity = new Entity();
        entity.addComponent(new Component());

        if (tagged) {
            entity.addTag(Tag);
        }

        runWorld.addEntity(entity);

        return query.resultLength;
    }

    it('With matches an entity which has the component', async () => {
        assert.equal(await count({c: Read(Component), _e: With(Component)}, false), 1);
    });

    it('With rejects an entity which lacks the component', async () => {
        assert.equal(await count({c: Read(Component), _e: With(Marker)}, false), 0);
    });

    it('Without rejects an entity which has the component', async () => {
        assert.equal(await count({c: Read(Component), _e: Without(Component)}, false), 0);
    });

    it('Without matches an entity which lacks the component', async () => {
        assert.equal(await count({c: Read(Component), _e: Without(Marker)}, false), 1);
    });

    it('WithTag matches a tagged entity', async () => {
        assert.equal(await count({c: Read(Component), _e: WithTag(Tag)}, true), 1);
    });

    it('WithTag rejects an untagged entity', async () => {
        assert.equal(await count({c: Read(Component), _e: WithTag(Tag)}, false), 0);
    });

    it('WithoutTag rejects a tagged entity', async () => {
        assert.equal(await count({c: Read(Component), _e: WithoutTag(Tag)}, true), 0);
    });

    it('WithoutTag matches an untagged entity', async () => {
        assert.equal(await count({c: Read(Component), _e: WithoutTag(Tag)}, false), 1);
    });

    it('does not pass existence parameters to the system as data', async () => {
        const query = queryComponents({c: Read(Component), _e: Without(Marker)});
        const System = createSystem({query}).withName('Probe').withRunFunction(() => {}).build();
        const prepWorld = buildWorld()
            .withDefaultScheduling(root => root.addNewStage(stage => stage.addSystem(System)))
            .withComponents(Component, Marker)
            .build();
        const runWorld = await prepWorld.prepareRun();
        runWorld.buildEntity().with(new Component()).build();

        const first = query.getFirst()!;
        assert.property(first, 'c');
        assert.notProperty(first, '_e');
    });
});
