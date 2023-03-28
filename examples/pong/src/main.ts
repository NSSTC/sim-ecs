import {buildWorld, IPreptimeWorld} from "sim-ecs";
import {UIItem} from "./components/ui-item.ts";
import {Paddle} from "./components/paddle.ts";
import {Position} from "./components/position.ts";
import {Velocity} from "./components/velocity.ts";
import {Shape} from "./components/shape.ts";
import {ScoreBoard} from "./models/score-board.ts";
import {Collision} from "./components/collision.ts";
import {Wall} from "./components/wall.ts";
import {PauseState} from "./states/pause.ts";
import {defaultSchedule} from "./schedules/default.ts";
import {pauseSchedule} from "./schedules/pause.ts";
import {GameState} from "./states/game.ts";
import {gameSchedule} from "./schedules/game.ts";
import {GameStore} from "./models/game-store.ts";
import {PaddleTransforms} from "./models/paddle-transforms.ts";
import {Dimensions} from "./models/dimensions.ts";
import {MenuState} from "./states/menu.ts";


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
