import {buildWorld, IPreptimeWorld} from "sim-ecs";
import {UIItem} from "./components/ui-item";
import {Paddle} from "./components/paddle";
import {Position} from "./components/position";
import {Velocity} from "./components/velocity";
import {Shape} from "./components/shape";
import {ScoreBoard} from "./models/score-board";
import {Collision} from "./components/collision";
import {Wall} from "./components/wall";
import {PauseState} from "./states/pause";
import {defaultSchedule} from "./schedules/default";
import {pauseSchedule} from "./schedules/pause";
import {GameState} from "./states/game";
import {gameSchedule} from "./schedules/game";
import {GameStore} from "./models/game-store";
import {PaddleTransforms} from "./models/paddle-transforms";
import {Dimensions} from "./models/dimensions";
import {MenuState} from "./states/menu";


const cleanup = () => {
    const canvasEle = document.querySelector('canvas');
    if (!canvasEle) throw new Error('Could not find canvas element!');

    const parentEle = canvasEle.parentElement!;
    const textEle = document.createElement('strong');

    parentEle.removeChild(canvasEle);
    textEle.innerText = 'Game Ended!';
    parentEle.appendChild(textEle);
};

const createWorld = () => {
    return buildWorld()
        .withDefaultScheduling(root => root.fromPrefab(defaultSchedule))
        .withStateScheduling(GameState, root => root.fromPrefab(gameSchedule))
        .withStateScheduling(PauseState, root => root.fromPrefab(pauseSchedule))
        .r(ScoreBoard)
        .r(GameStore)
        .r(PaddleTransforms, {
            constructorArgs: [
                {
                    dimensions: new Dimensions(0, 0),
                    position: new Position(0, 0),
                }, {
                    dimensions: new Dimensions(0, 0),
                    position: new Position(0, 0),
                },
            ]
        })
        .withComponents(
            Collision,
            Paddle,
            Position,
            Shape,
            UIItem,
            Velocity,
            Wall,
        )
        .build();
};

const initGame = async (world: IPreptimeWorld) => {
    const canvasEle = document.querySelector('canvas');
    if (!canvasEle) throw new Error('Could not find canvas element!');

    const renderContext = canvasEle.getContext('2d');
    if (!renderContext) throw new Error('Could not initialize 2D context');

    const canvasBoundingRect = canvasEle.getBoundingClientRect();

    canvasEle.width = canvasBoundingRect.width;
    canvasEle.height = canvasBoundingRect.height;

    renderContext.imageSmoothingEnabled = true;
    renderContext.imageSmoothingQuality = 'high';

    world.addResource(renderContext);
    world.addResource(
        PaddleTransforms,
        {
            dimensions: new Dimensions(0, 0),
            position: new Position(0, 0),
        },
        {
            dimensions: new Dimensions(0, 0),
            position: new Position(0, 0),
        });

    if (localStorage.getItem('dev') === 'true') {
        // @ts-ignore
        window.prepWorld = world;
    }
};

const runGame = async (world: IPreptimeWorld) => {
    const runWorld = await world.prepareRun({
        initialState: MenuState,
    });

    if (localStorage.getItem('dev') === 'true') {
        // @ts-ignore
        window.runWorld = runWorld;
    }

    await runWorld.start();
}

// main function
window.addEventListener('DOMContentLoaded', () => (async () => {
    const world = createWorld();

    await initGame(world);
    await runGame(world);
    cleanup();
})().catch(console.error));
