import type {IRuntimeWorld, IRuntimeWorldInitConfig, TExecutionFunction} from "./runtime-world.spec";
import {
    addEntity,
    buildEntity,
    clearEntities,
    getEntities,
    createEntity,
    hasEntity,
    removeEntity
} from "../common/world_entities";
import {
    addEntitiesToGroup,
    addEntityToGroup,
    assimilateGroup,
    clearGroups,
    createGroup,
    getGroupEntities,
    removeGroup
} from "../common/world_groups";
import {merge} from "../common/world_misc";
import {load, save} from "../common/world_prefabs";
import {
    addResource,
    clearResources,
    getResource,
    getResources,
    hasResource,
    removeResource,
    replaceResource
} from "../common/world_resources";
import {PushDownAutomaton} from "../../pda/pda";
import type {IState} from "../../state/state.spec";
import {popState, pushState} from "./runtime-world_states";
import {EventBus} from "../../events/event-bus";
import type {IScheduler} from "../../scheduler/scheduler.spec";
import type {TExecutor} from "../../_.spec";
import type {IMutableWorld, IWorldData} from "../world.spec";
import {Commands} from "./commands/commands";
import type {ISystemActions, ITransitionActions} from "../actions.spec";
import {getQueriesFromSystem} from "../../system/system";
import {setEntitiesSym} from "../../query/_";
import { IQuery } from "../../query/query.spec";

export * from "./runtime-world.spec";


export class RuntimeWorld implements IRuntimeWorld, IMutableWorld {
    protected awaiterReject!: Function;
    protected awaiterResolve!: Function;
    #awaiter?: Promise<void>;
    protected readonly commands = new Commands(this);
    protected currentScheduler: IScheduler;
    protected currentSchedulerExecutor?: TExecutor;
    public readonly eventBus = new EventBus();
    protected executionFunction: TExecutionFunction;
    protected isPrepared = false;
    protected readonly pda = new PushDownAutomaton<IState>();
    protected shouldRunSystems = false;
    systemWorld: ISystemActions;
    transitionWorld: ITransitionActions;

    constructor(
        public name: string,
        public config: IRuntimeWorldInitConfig,
        public data: IWorldData,
    ) {
        this.currentScheduler = this.config.defaultScheduler;
        this.executionFunction = this.config.executionFunction ?? (
            typeof requestAnimationFrame == 'function'
                ? requestAnimationFrame
                : setTimeout
        );
        this.transitionWorld = this;

        {
            const self = this;
            this.systemWorld = {
                get commands() { return self.commands },
                get currentState() { return this.currentState },
                getEntities: this.getEntities.bind(this),
                // @ts-ignore TS bug?
                getResource: this.getResource.bind(this),
                hasResource: this.hasResource.bind(this),
            };
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

    public async prepare(): Promise<void> {
        await this.config.defaultScheduler.prepare(this);

        {
            const queries = new Set<IQuery<unknown, unknown>>();
            let scheduler;
            let query, system;

            for (system of this.config.defaultScheduler.getSystems()) {
                for (query of getQueriesFromSystem(system)) {
                    queries.add(query);
                }
            }

            for (scheduler of this.config.stateSchedulers.values()) {
                await scheduler.prepare(this);

                for (system of scheduler.getSystems()) {
                    for (query of getQueriesFromSystem(system)) {
                        queries.add(query);
                    }
                }
            }

            for (query of queries) {
                query[setEntitiesSym](this.data.entities.keys());
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
            await this.pushState(this.config.initialState);

            {
                const execFn = this.executionFunction;
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

                const cleanUp = () => {
                    this.pda.clear();
                    this.awaiterResolve();
                    this.#awaiter = undefined;
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

                {
                    let syncPoint;
                    for (syncPoint of this.currentScheduler!.pipeline!.getGroups()) {
                        syncPoint.addOnSyncHandler(syncHandler);
                    }
                }

                this.shouldRunSystems = true;
                execFn(mainLoop);
            }
        })().catch(err => this.awaiterReject(err));

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
