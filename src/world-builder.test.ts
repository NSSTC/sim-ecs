import {expect} from 'chai';
import {WorldBuilder} from "./world-builder";
import {NoData, System} from "./system";

class ASystem extends System<NoData> {
    readonly SystemDataType = NoData;
    async run(dataSet: Set<NoData>): Promise<void> {}
}

describe('Test WorldBuilder', () => {
    it('Unique Systems', () => {
        const builder = new WorldBuilder();
        builder.withSystem(new ASystem());
        expect(builder.withSystem.bind(builder, new ASystem())).to.throw();
    });
});
