import {assert} from 'chai';
import {Query, Read, Write} from "./query";

class Component {
    health = 100
}

describe('Test Query', () => {
    it('pop', () => {
        const query = new Query({
            testR: Read(Component),
            testW: Write(Component),
        });

        for (const {testR, testW} of query.iter()) {
            testW.health++;
            testR.health++;
        }
    });
});
