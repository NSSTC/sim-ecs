import type {ISerDeOptions, TSerializer} from "../../serde/serde.spec.ts";
import type {ISerialFormat} from "../../serde/serial-format.spec.ts";
import {type PreptimeWorld} from "./preptime-world.ts";
import type {TGroupHandle} from "../world.spec.ts";
import type {TDeserializer} from "../../serde/serde.spec.ts";
import type {IEntity} from "../../entity/entity.spec.ts";
import type {TObjectProto} from "../../_.spec.ts";

export function load(
    this: PreptimeWorld,
    prefab: Readonly<ISerialFormat>,
    options?: Readonly<ISerDeOptions<TDeserializer>>,
    intoGroup?: TGroupHandle,
): TGroupHandle {
    let groupHandle = intoGroup;
    if (groupHandle == undefined || !this.data.groups.entityLinks.has(groupHandle)) {
        groupHandle = this.createGroup();
    }

    const serdeOut = this.config.serde.deserialize(prefab, options);

    {
        const entities = this.data.groups.entityLinks.get(groupHandle)!;
        let entity: IEntity;

        for (entity of serdeOut.entities) {
            this.addEntity(entity);
            entities.add(entity);
        }
    }

    {
        let resource: object | TObjectProto;
        for (resource of Object.values(serdeOut.resources)) {
            // @ts-ignore should work
            this.addResource(resource);
        }
    }

    return groupHandle;
}

export function save(this: PreptimeWorld, options?: Readonly<ISerDeOptions<TSerializer>>): ISerialFormat {
    const resources = Object.fromEntries(options?.resources?.map(type => [type.constructor.name]) ?? []);
    return this.config.serde.serialize({
        entities: this.getEntities(options?.entities),
        resources,
    }, options);
}
