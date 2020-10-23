import {expect} from "chai";
import {World} from "./world";
import {SaveFormat} from "./save-format";

describe('Test World', () => {
    it('Load Prefabs', () => {
        const saveFormat = new SaveFormat();
        const world = new World(new Map());

        saveFormat.registerComponent(
            Date, data => new Date(data as number), date => (date as Date).getTime().toString());
        world.setSaveFormat(saveFormat);
        const prefabHandle = world.loadPrefab([{ Date: 0 }]);

        const entities = Array.from(world.getEntities());
        expect(entities.length).eq(1);
        expect(entities[0].hasComponent(Date)).eq(true);
        expect(entities[0].getComponent(Date)?.getTime()).eq(0);

        expect(world.unloadPrefab.bind(world, prefabHandle)).to.not.throw();
        expect(Array.from(world.getEntities()).length).eq(0);
    });
});
