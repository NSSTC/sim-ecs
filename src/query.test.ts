import {assert} from 'chai';
import {Query, Read, ReadEntity, Write} from "./query";

class Component {
    health = 100
}

describe('Test Query', () => {
    it('pop', () => {
        const query = new Query({
            entity: ReadEntity(),
            testR: Read(Component),
            testW: Write(Component),
        });

        for (const {testW} of query.iter()) {
            testW.health++;
        }
    });
});
