import type {
    IRuntimeWorld,
    IRuntimeWorldInitConfig,
    IRuntimeWorldInitData,
    TExecutionFunction,
} from "./runtime-world.spec.ts";
import {
    buildEntity,
    clearEntities,
    createEntity,
    getEntities,
} from "../common/world_entities.ts";
import {
    addEntitiesToGroup,
    addEntityToGroup,
    assimilateGroup,
    clearGroups,
    createGroup,
    getGroupEntities,
    removeGroup,
} from "../common/world_groups.ts";
import {merge} from "../common/world_misc.ts";
import {load, save} from "./runtime-world_prefabs.ts";
import {
    clearResources,
    getResource,
    getResources,
    hasResource,
} from "../common/world_resources.ts";
import {addEntity, hasEntity, refreshEntityQueryRegistration, removeEntity} from "./runtime-world_entities.ts";
import {addResource, removeResource, replaceResource} from "./runtime-world_resources.ts";
import {SimECSPushDownAutomaton} from "../../pda/sim-ecs-pda.ts";
import type {IState} from "../../state/state.spec.ts";
import {popState, pushState} from "./runtime-world_states.ts";
import {EventBus, TSubscriber} from "../../events/event-bus.ts";
import type {IScheduler} from "../../scheduler/scheduler.spec.ts";
import type {TExecutor, TTypeProto} from "../../_.spec.ts";
import type {IMutableWorld} from "../world.spec.ts";
import {Commands} from "./commands/commands.ts";
import type {ISystemActions, ITransitionActions} from "../actions.spec.ts";
import {getQueriesFromSystem} from "../../system/system.ts";
import type {ISystem} from "../../system/system.spec.ts";
import {runSortSym, setEntitiesSym} from "../../query/_.ts";
import type {IRuntimeWorldData} from "./runtime-world.spec.ts";
import {Query} from "../../query/query.ts";
import {SimECSPDAPushStateEvent} from "../../events/internal-events.ts";
import type {ISyncPoint} from "../../scheduler/pipeline/sync-point.spec.ts";
import {systemRunParamSym} from "../../system/_.ts";
import type {IEntity, IEventMap} from "../../entity/entity.spec.ts";

export * from "./runtime-world.spec.ts";
export * from "./commands/commands.spec.ts";


export class RuntimeWorld implements IRuntimeWorld, IMutableWorld {
    protected awaiterReject!: Function;
    protected awaiterResolve!: Function;
    #awaiter?: Promise<void>;
    protected readonly commands: Commands;
    protected currentScheduler: IScheduler;
    protected currentSchedulerExecutor?: TExecutor;
    public data: IRuntimeWorldData;
    protected entityEventHandlers = new Map<IEntity, IEventMap>();
    public readonly eventBus = new EventBus();
    protected executionFunction: TExecutionFunction;
    protected isPrepared = false;
    protected readonly pda = new SimECSPushDownAutomaton<IState>(this);
    protected queries = new Set<Readonly<Query<unknown, unknown>>>();
    protected shouldRunSystems = false;
    protected systems: Set<ISystem>;
    protected systemWorld: ISystemActions;
    protected transitionWorld: ITransitionActions;

    constructor(
        public name: string,
        public config: IRuntimeWorldInitConfig,
        protected $data?: Partial<IRuntimeWorldInitData>,
    ) {
        this.commands = new Commands(this, this.queries);
        this.currentScheduler = this.config.defaultScheduler;
        this.executionFunction = this.config.executionFunction ?? (
            typeof requestAnimationFrame == 'function'
                ? requestAnimationFrame
                : setTimeout
        );

        this.data = {
            entities: new Set($data?.entities ? $data?.entities : new Set()),
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

        { // Get all systems and cache the result
            this.systems = new Set(this.config.defaultScheduler.getSystems());
            let scheduler;
            let system;

            for (scheduler of this.config.stateSchedulers.values()) {
                for (system of scheduler.getSystems()) {
                    this.systems.add(system);
                }
            }
        }

        { // set the context for all systems
            let system;

            for (system of this.systems) {
                if (system.runtimeContext !== undefined) {
                    throw new Error('Cannot use a system in two runtimes at the same time!');
                }

                system.setRuntimeContext(this);
            }
        }
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

    public hmrReplaceSystem(newSystem: ISystem): void {
        const newName = newSystem.name;
        const schedulers = [this.config.defaultScheduler, ...this.config.stateSchedulers.values()];
        let i, stage, system, systems;

        schedulers
            .flatMap(scheduler => scheduler.pipeline.getGroups())
            .forEach(group => {
                for (stage of group.stages) {
                    systems = stage.systems;
                    i = 0;

                    for (system = systems[i]; !!system; system = systems[++i]) {
                        if (system.name == newName) {
                            newSystem[systemRunParamSym] = system[systemRunParamSym];
                            systems[i] = newSystem;
                        }
                    }
                }
            });
    }

    public async prepare(): Promise<void> {
        await this.config.defaultScheduler.prepare(this);
        this.pda.clear(this.transitionActions);

        {
            let scheduler;
            let query, system;

            for (system of this.config.defaultScheduler.getSystems()) {
                system.setRuntimeContext(this);
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

        {
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

                {
                    let query;
                    for (query of this.queries) {
                        query[runSortSym]();
                    }
                }
            }

            const pushStateHandler: TSubscriber<TTypeProto<SimECSPDAPushStateEvent>> = event => {
                const stateScheduler = this.config.stateSchedulers.get(event.newState.constructor) ?? this.config.defaultScheduler;
                let syncPoint;

                for (syncPoint of stateScheduler.pipeline!.getGroups()) {
                    syncPoints.add(syncPoint);
                    syncPoint.addOnSyncHandler(syncHandler);
                }
            };

            const cleanUp = () => {
                this.eventBus.unsubscribe(SimECSPDAPushStateEvent, pushStateHandler);
                this.pda.clear(this.transitionActions);

                {
                    let syncPoint;
                    for (syncPoint of syncPoints) {
                        syncPoint.clearOnSyncHandlers();
                    }
                }

                this.#awaiter = undefined;
                this.awaiterResolve();
            };

            (async () => {
                this.eventBus.subscribe(SimECSPDAPushStateEvent, pushStateHandler);
                await this.pushState(this.config.initialState);

                {
                    const execFn = this.executionFunction;

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
                cleanUp();
                this.awaiterReject(err);
                this.#awaiter = undefined;
            });
        }

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

    // @ts-ignore
    [Symbol.dispose]() {
        // unset the context for all systems
        let system;
        for (system of this.systems) {
            system.unsetRuntimeContext(this);
        }
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
    public refreshEntityQueryRegistration = refreshEntityQueryRegistration;
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


    /// ****************************************************************************************************************
    /// States
    /// ****************************************************************************************************************

    public popState = popState;
    public pushState = pushState;
}
