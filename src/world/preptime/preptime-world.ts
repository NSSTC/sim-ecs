import type {IPrepOptions, IPreptimeWorld, IPreptimeWorldConfig} from "./preptime-world.spec";
import type {IWorldData} from "../world.spec";
import {SerDe} from "../../serde/serde";
import {Scheduler} from "../../scheduler/scheduler";
import {
    addEntity,
    buildEntity,
    clearEntities,
    createEntity,
    getEntities,
    hasEntity,
    removeEntity,
} from "../common/world_entities";
import {
    addResource,
    clearResources,
    getResource,
    getResources,
    hasResource,
    removeResource,
    replaceResource,
} from "../common/world_resources";
import {
    addEntitiesToGroup,
    addEntityToGroup,
    assimilateGroup,
    clearGroups,
    createGroup,
    getGroupEntities,
    removeGroup,
} from "../common/world_groups";
import {load, save} from "../common/world_prefabs";
import {merge} from "../common/world_misc";
import type {IRuntimeWorld} from "../runtime/runtime-world.spec";
import {RuntimeWorld} from "../runtime/runtime-world";
import {State} from "../../state/state";

export * from "./preptime-world.spec";


export class PreptimeWorld implements IPreptimeWorld {
    public config: IPreptimeWorldConfig;
    public data: IWorldData;

    constructor(
        public name?: string,
        $config?: Partial<IPreptimeWorldConfig>,
        $data?: Partial<IWorldData>,
    ) {
        {
            const config = $config
                ? $config
                : {};

            this.config = {
                defaultScheduler: config.defaultScheduler ?? new Scheduler(),
                serde: config.serde ?? new SerDe(),
                states: config.states ?? new Set(),
                stateSchedulers: config.stateSchedulers ?? new Map(),
            };
        }

        {
            const data = $data
                ? $data
                : {};

            this.data = {
                entities: data.entities ?? new Set(),
                groups: data.groups ?? {
                    entityLinks: new Map(),
                    nextHandle: 0,
                },
                resources: data.resources ?? new Map(),
            };
        }
    }

    async prepareRun(options?: Partial<IPrepOptions>): Promise<IRuntimeWorld> {
        const name = this.name
            ? this.name + '_run'
            : 'NO_NAME';

        const runWorld = new RuntimeWorld(
            name,
            Object.assign({
                executionFunction: options?.executionFunction,
                initialState: options?.initialState ?? State,
            }, this.config),
            this.data,
        );

        // todo: don't copy the refs, copy all objects

        await runWorld.prepare();
        return runWorld;
    }

    /// ****************************************************************************************************************
    /// Entities
    /// ****************************************************************************************************************
    public addEntity = addEntity;
    public buildEntity = buildEntity;
    public clearEntities = clearEntities;
    public createEntity = createEntity;
    public getEntities = getEntities;
    public hasEntity = hasEntity;
    public removeEntity = removeEntity;

    /// ****************************************************************************************************************
    /// Groups
    /// ****************************************************************************************************************
    public addEntityToGroup = addEntityToGroup;
    public addEntitiesToGroup = addEntitiesToGroup;
    public assimilateGroup = assimilateGroup;
    public clearGroups = clearGroups;
    public createGroup = createGroup;
    public getGroupEntities = getGroupEntities;
    public removeGroup = removeGroup;

    /// ****************************************************************************************************************
    /// Misc
    /// ****************************************************************************************************************
    public merge = merge;

    /// ****************************************************************************************************************
    /// Prefabs
    /// ****************************************************************************************************************
    public load = load;
    public save = save;

    /// ****************************************************************************************************************
    /// Resources
    /// ****************************************************************************************************************
    public addResource = addResource;
    public clearResources = clearResources;
    public getResource = getResource;
    public getResources = getResources;
    public hasResource = hasResource;
    public removeResource = removeResource;
    public replaceResource = replaceResource;
}
