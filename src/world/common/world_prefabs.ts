import type {ISerDeOptions, TDeserializer, TSerializer} from "../../serde/serde.spec";
import type {ISerialFormat} from "../../serde/serial-format.spec";
import type {TGroupHandle} from "../world.spec";
import {type PreptimeWorld} from "../preptime/preptime-world";
import type {IEntity} from "../../entity/entity.spec";
import {type RuntimeWorld} from "../runtime/runtime-world";

export function load(this: PreptimeWorld | RuntimeWorld, prefab: ISerialFormat, options?: ISerDeOptions<TDeserializer>, intoGroup?: TGroupHandle): TGroupHandle {
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
        let resource;
        for (resource of Object.values(serdeOut.resources)) {
            if (options?.replaceResources) {
                if (this.hasResource(resource)) {
                    this.replaceResource(resource);
                } else {
                    this.addResource(resource);
                }
            } else {
                this.addResource(resource);
            }
        }
    }

    return groupHandle;
}

export function save(this: PreptimeWorld | RuntimeWorld, options?: ISerDeOptions<TSerializer>): ISerialFormat {
    return this.config.serde.serialize({
        entities: this.getEntities(options?.entities),
        resources: Object.fromEntries(options?.resources?.map(type => [type.constructor.name, this.getResource(type)!]) ?? []),
    }, options);
}
