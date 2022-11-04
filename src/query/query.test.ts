import {Read, ReadEntity, Write} from "./query";
import {queryComponents} from "../ecs/ecs-query";

class Component {
    health = 100
}

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
