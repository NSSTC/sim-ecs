import {assert} from 'chai';
import {EntityBuilder} from "./entity-builder.ts";
import {buildWorld} from "../ecs/ecs-world.ts";
import {createSystem} from "../system/system.ts";
import {queryComponents} from "../ecs/ecs-query.ts";
import {Read, WithTag, WithoutTag} from "../query/query.ts";

class Component {
    health = 100
}

const Tag = 'a-tag';

describe('Test EntityBuilder', () => {
    it('withTag', () => {
        const entity = new EntityBuilder().withTag(Tag).build();

        assert.isTrue(entity.hasTag(Tag));
        assert.equal(entity.getTagCount(), 1);
    });

    it('withTags', () => {
        const entity = new EntityBuilder().withTags(Tag, 'another').build();

        assert.equal(entity.getTagCount(), 2);
    });

    it('deduplicates repeated tags', () => {
        const entity = new EntityBuilder().withTag(Tag).withTag(Tag).build();

        assert.equal(entity.getTagCount(), 1);
    });

    it('applies tags before the entity is handed to the world', () => {
        let tagged = false;
        new EntityBuilder(undefined, entity => tagged = entity.hasTag(Tag))
            .withTag(Tag)
            .build();

        assert.isTrue(tagged);
    });
});

describe('Tags set at build time are visible to queries', () => {
    async function count(descriptor: Parameters<typeof queryComponents>[0], tagged: boolean) {
        const query = queryComponents(descriptor);
        const System = createSystem({query}).withName('Probe').withRunFunction(() => {}).build();
        const prepWorld = buildWorld()
            .withDefaultScheduling(root => root.addNewStage(stage => stage.addSystem(System)))
            .withComponents(Component)
            .build();
        const runWorld = await prepWorld.prepareRun();
        const builder = runWorld.buildEntity().with(new Component());

        if (tagged) {
            builder.withTag(Tag);
        }

        builder.build();

        return query.resultLength;
    }

    it('WithTag matches an entity tagged by the builder', async () => {
        assert.equal(await count({c: Read(Component), _e: WithTag(Tag)}, true), 1);
    });

    it('WithoutTag rejects an entity tagged by the builder', async () => {
        assert.equal(await count({c: Read(Component), _e: WithoutTag(Tag)}, true), 0);
    });

    it('WithoutTag matches an entity the builder left untagged', async () => {
        assert.equal(await count({c: Read(Component), _e: WithoutTag(Tag)}, false), 1);
    });
});
