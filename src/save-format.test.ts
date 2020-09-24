import {expect} from 'chai';
import {defaultDeserializer, SaveFormat} from "./save-format";

const serializedWorld = JSON.stringify([
    [],
    [
        ["Date", "1970-01-01T00:00:00.000Z"]
    ],
    [
        ["Date", "1970-01-01T00:00:01.337Z"],
        ["C1", {"a": 0}],
    ]
]);
const serializedWorldBasic = '[[]]';
const serializedWorldCustom = JSON.stringify([
    [
        ["C1", {"a": 0}],
    ]
]);
const serializedWorldDefault = JSON.stringify([
    [
        ["Date", "1970-01-01T00:00:00.000Z"],
        ["Object", {a: 0}],
        ["String", "Foo"],
    ],
]);

describe('Test SaveFormat', () => {
    it('load/save round-trip', () => {
        expect(SaveFormat.fromJSON(serializedWorld).toJSON()).eq(serializedWorld);
    });

    it('getEntities()', () => {
        const entities = Array.from(SaveFormat.fromJSON(serializedWorldBasic).getEntities());

        expect(entities.length).eq(1);
        expect(Array.from(entities[0].getComponents()).length).eq(0);
    });

    it('getEntities() with default components', () => {
        const entities = Array.from(SaveFormat.fromJSON(serializedWorldDefault).getEntities(defaultDeserializer()));
        expect(entities.length).eq(1);

        const components = Array.from(entities[0].getComponents());
        expect(components.length).eq(3);

        expect(components[0].constructor.name).eq('Date');
        expect((components[0] as Date).getTime()).eq(0);
        expect(typeof components[1]).eq('object');
        expect(typeof components[2]).eq('string');
    });

    it('getEntities() with custom components', () => {
        class C1 {
            constructor(public a: number) {
            }
        }

        const save = new SaveFormat();

        save.loadJSON(serializedWorldCustom);
        save.registerComponent(C1, rawData => {
            expect(Object.getOwnPropertyNames(rawData).includes('a')).eq(true);
            expect((rawData as C1).a).eq(0);

            return new C1((rawData as C1).a);
        });

        const entities = Array.from(save.getEntities());
        expect(entities.length).eq(1);

        const components = Array.from(entities[0].getComponents());
        expect(components.length).eq(1);
        expect(components[0] instanceof C1).eq(true);
    });
});
