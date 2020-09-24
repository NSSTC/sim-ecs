import {expect} from 'chai';
import {defaultDeserializer, defaultSerializer, SaveFormat} from "./save-format";

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
        ["Map", [[1, 1], [2, 17]]],
        ["Object", {a: 0}],
        ["Set", [1, 2, 3]],
        ["String", "Foo"],
    ],
]);

describe('Test SaveFormat', () => {
    it('load/save round-trip', () => {
        expect(SaveFormat.fromJSON(serializedWorld).toJSON()).eq(serializedWorld);
    });

    it('extended load/save round-trip', () => {
        expect(
            new SaveFormat({
                entities: Array.from(SaveFormat.fromJSON(serializedWorldDefault).getEntities(defaultDeserializer()))[Symbol.iterator](),
            }, defaultSerializer()).toJSON()
        ).eq(serializedWorldDefault);
    })

    it('getEntities()', () => {
        const entities = Array.from(SaveFormat.fromJSON(serializedWorldBasic).getEntities());

        expect(entities.length).eq(1);
        expect(Array.from(entities[0].getComponents()).length).eq(0);
    });

    it('getEntities() with default components', () => {
        const entities = Array.from(SaveFormat.fromJSON(serializedWorldDefault).getEntities(defaultDeserializer()));
        expect(entities.length).eq(1);

        const components = Array.from(entities[0].getComponents());
        expect(components.length).eq(5);

        expect(components[0].constructor.name).eq('Date');
        expect((components[0] as Date).getTime()).eq(0);
        expect(components[0].constructor.name).eq('Date');
        expect(components[1].constructor.name).eq('Map');
        expect(components[2].constructor.name).eq('Object');
        expect(components[3].constructor.name).eq('Set');
        expect(typeof components[4]).eq('string');
    });

    it('getEntities() with custom components', () => {
        class C1 {
            constructor(public a: number) {}
        }

        const save = new SaveFormat();

        save.loadJSON(serializedWorldCustom);
        save.registerComponent(C1, rawData => {
            expect(Object.getOwnPropertyNames(rawData).includes('a')).eq(true);
            expect((rawData as C1).a).eq(0);

            return new C1((rawData as C1).a);
        }, c1 => JSON.stringify(c1));

        const entities = Array.from(save.getEntities());
        expect(entities.length).eq(1);

        const components = Array.from(entities[0].getComponents());
        expect(components.length).eq(1);
        expect(components[0] instanceof C1).eq(true);
    });
});
