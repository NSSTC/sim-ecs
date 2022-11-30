import type {
    IRuntimeWorld,
    IRuntimeWorldInitConfig,
    IRuntimeWorldInitData,
    TExecutionFunction,
} from "./runtime-world.spec";
import {
    buildEntity,
    clearEntities,
    createEntity,
    getEntities,
} from "../common/world_entities";
import {
    addEntitiesToGroup,
    addEntityToGroup,
    assimilateGroup,
    clearGroups,
    createGroup,
    getGroupEntities,
    removeGroup,
} from "../common/world_groups";
import {merge} from "../common/world_misc";
import {load, save} from "./runtime-world_prefabs";
import {
    clearResources,
    getResource,
    getResources,
    hasResource,
    removeResource,
} from "../common/world_resources";
import {addEntity, hasEntity, removeEntity} from "./runtime-world_entities";
import {addResource, replaceResource} from "./runtime-world_resources";
import {SimECSPushDownAutomaton} from "../../pda/sim-ecs-pda";
import type {IState} from "../../state/state.spec";
import {popState, pushState} from "./runtime-world_states";
import {EventBus} from "../../events/event-bus";
import type {IScheduler} from "../../scheduler/scheduler.spec";
import type {TExecutor, TObjectProto} from "../../_.spec";
import type {IMutableWorld} from "../world.spec";
import {Commands} from "./commands/commands";
import type {ISystemActions, ITransitionActions} from "../actions.spec";
import {getQueriesFromSystem} from "../../system/system";
import type {ISystem} from "../../system/system.spec";
import {setEntitiesSym} from "../../query/_";
import type {IRuntimeWorldData} from "./runtime-world.spec";
import {Query} from "../../query/query";
import {registerSystemAddResourceEvent} from "./runtime-world_events";
import {SimECSPDAPushStateEvent} from "../../events/internal-events";
import type {ISyncPoint} from "../../scheduler/pipeline/sync-point.spec";

export * from "./runtime-world.spec";
export * from "./commands/commands.spec";


export class RuntimeWorld implements IRuntimeWorld, IMutableWorld {
    protected awaiterReject!: Function;
    protected awaiterResolve!: Function;
    #awaiter?: Promise<void>;
    protected readonly commands: Commands;
    protected currentScheduler: IScheduler;
    protected currentSchedulerExecutor?: TExecutor;
    public data: IRuntimeWorldData;
    public readonly eventBus = new EventBus();
    protected executionFunction: TExecutionFunction;
    protected isPrepared = false;
    protected readonly pda = new SimECSPushDownAutomaton<IState>(this);
    protected queries = new Set<Query<unknown, unknown>>();
    protected shouldRunSystems = false;
    protected systemResourceMap = new Map<ISystem, { paramName: string, resourceType: TObjectProto }>();
    protected systemWorld: ISystemActions;
    protected transitionWorld: ITransitionActions;

    constructor(
        public name: string,
        public config: IRuntimeWorldInitConfig,
        $data?: Partial<IRuntimeWorldInitData>,
    ) {
        this.commands = new Commands(this, this.queries);
        this.currentScheduler = this.config.defaultScheduler;
        this.executionFunction = this.config.executionFunction ?? (
            typeof requestAnimationFrame == 'function'
                ? requestAnimationFrame
                : setTimeout
        );

        this.data = {
            entities: $data?.entities ? $data?.entities : new Set(),
            groups: $data?.groups ?? {
                entityLinks: new Map(),
                nextHandle: 0,
            },
            resources: new Map(),
        };

        if ($data?.resources) {
            for (const [Type, args] of $data.resources) {
                this.addResource(Type, ...args);
            }
        }

        {
            const self = this;
            this.systemWorld = {
                get commands() { return self.commands },
                get currentState() { return self.currentState },
                getEntities: this.getEntities.bind(this),
                // @ts-ignore TS bug?
                getResource: this.getResource.bind(this),
                hasResource: this.hasResource.bind(this),
            };
            this.transitionWorld = Object.assign({
                eventBus: this.eventBus,
                popState: this.popState.bind(this),
                pushState: this.pushState.bind(this),
                flushCommands: this.flushCommands.bind(this),
                save: this.save.bind(this),
            }, this.systemWorld)
        }

        this.registerSystemAddResourceEvent();
        //this.registerSystemReplaceResourceEvent();
    }

    get awaiter(): Promise<void> | undefined {
        return this.#awaiter;
    }

    get currentState(): Readonly<IState> | undefined {
        return this.pda.state;
    }

    get isRunning(): boolean {
        return Boolean(this.#awaiter);
    }

    get systemActions(): ISystemActions {
        return this.systemWorld;
    }

    get transitionActions(): ITransitionActions {
        return this.transitionWorld;
    }

    public flushCommands(): Promise<void> {
        return this.commands.executeAll();
    }

    public async prepare(): Promise<void> {
        await this.config.defaultScheduler.prepare(this);
        this.pda.clear();

        {
            let scheduler;
            let query, system;

            for (system of this.config.defaultScheduler.getSystems()) {
                for (query of getQueriesFromSystem(system)) {
                    this.queries.add(query);
                }
            }

            for (scheduler of this.config.stateSchedulers.values()) {
                await scheduler.prepare(this);

                for (system of scheduler.getSystems()) {
                    for (query of getQueriesFromSystem(system)) {
                        this.queries.add(query);
                    }
                }
            }

            for (query of this.queries) {
                query[setEntitiesSym](this.data.entities.values());
            }
        }

        this.isPrepared = true;
    }

    public start(): Promise<void> {
        if (!this.isPrepared) {
            throw new Error(`The runtime world "${this.name}" wasn't prepared, yet!`);
        }

        if (this.#awaiter) {
            throw new Error(`The runtime world "${this.name}" is already running!`);
        }

        this.#awaiter = new Promise<void>((resolve, reject) => {
            this.awaiterReject = reject;
            this.awaiterResolve = resolve;
        });

        (async () => {
            const syncPoints = new Set<ISyncPoint>();

            const syncHandler = async () => {
                try {
                    await this.commands.executeAll();
                } catch (error) {
                    if (typeof error == 'object' && error != null) {
                        await this.eventBus.publish(error);
                    } else {
                        throw error;
                    }
                }
            }

            this.eventBus.subscribe(SimECSPDAPushStateEvent, event => {
                const stateScheduler = this.config.stateSchedulers.get(event.state) ?? this.config.defaultScheduler;
                let syncPoint;

                for (syncPoint of stateScheduler.pipeline!.getGroups()) {
                    syncPoints.add(syncPoint);
                    syncPoint.addOnSyncHandler(syncHandler);
                }
            });

            await this.pushState(this.config.initialState);

            {
                const execFn = this.executionFunction;
                const cleanUp = () => {
                    this.pda.clear();
                    this.awaiterResolve();
                    this.#awaiter = undefined;

                    {
                        let syncPoint;
                        for (syncPoint of syncPoints) {
                            syncPoint.clearOnSyncHandlers();
                        }
                    }
                };

                const mainLoop = async () => {
                    if (!this.shouldRunSystems) {
                        cleanUp();
                        return;
                    }

                    try {
                        await this.currentSchedulerExecutor!();
                    } catch (error) {
                        if (typeof error == 'object' && error != null) {
                            await this.eventBus.publish(error);
                        } else {
                            throw error;
                        }
                    }

                    execFn(mainLoop);
                }

                this.shouldRunSystems = true;
                execFn(mainLoop);
            }
        })().catch(err => {
            this.awaiterReject(err);
            this.#awaiter = undefined;
        });

        return this.#awaiter;
    }

    public async step(): Promise<void> {
        const originalExecutionFn = this.executionFunction;
        this.executionFunction = (mainLoop: Function) => {
            originalExecutionFn(() => {
                mainLoop();
                this.stop();
            });
        };
        await this.start();
        this.executionFunction = originalExecutionFn;
    }

    public stop(): void {
        this.shouldRunSystems = false;
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
    /// Events
    /// ****************************************************************************************************************

    protected registerSystemAddResourceEvent = registerSystemAddResourceEvent;


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


    /// ****************************************************************************************************************
    /// States
    /// ****************************************************************************************************************

    /**
     * Remove the current state and switch to the last one
     * @protected
     */
    public popState = popState;

    /**
     * Switch to a new state
     * @protected
     */
    public pushState = pushState;
}
