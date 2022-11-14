import type {ISerDeOptions, TSerializer} from "../../serde/serde.spec";
import type {ISerialFormat} from "../../serde/serial-format.spec";
import {type PreptimeWorld} from "./preptime-world";
import type {TGroupHandle} from "../world.spec";
import type {TDeserializer} from "../../serde/serde.spec";
import type {IEntity} from "../../entity/entity.spec";
import type {TObjectProto} from "../../_.spec";

export function load(this: PreptimeWorld, prefab: ISerialFormat, options?: ISerDeOptions<TDeserializer>, intoGroup?: TGroupHandle): TGroupHandle {
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
        let resource: Object | TObjectProto;
        for (resource of Object.values(serdeOut.resources)) {
            // @ts-ignore should work
            this.addResource(resource);
        }
    }

    return groupHandle;
}

export function save(this: PreptimeWorld, options?: ISerDeOptions<TSerializer>): ISerialFormat {
    const resources = Object.fromEntries(options?.resources?.map(type => [type.constructor.name]) ?? []);
    return this.config.serde.serialize({
        entities: this.getEntities(options?.entities),
        resources,
    }, options);
}
