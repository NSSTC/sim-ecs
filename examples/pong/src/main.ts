import {ECS, IWorld} from "sim-ecs";
import {PaddleSystem} from "./systems/paddle";
import {afterFrameHandler, beforeFrameHandler} from "./app/frame-transition-handlers";
import {InputSystem} from "./systems/input";
import {GameStore} from "./models/game-store";
import {MenuState} from "./states/menu";
import {UIItem} from "./components/ui-item";
import {MenuSystem} from "./systems/menu";
import {MenuItem, PauseItem, ScoreItem} from "./components/_markers";
import {PauseSystem} from "./systems/pause";
import {Paddle} from "./components/paddle";
import {Position} from "./components/position";
import {Ball} from "./components/ball";
import {BallSystem} from "./systems/ball";
import {ScoreSystem} from "./systems/score";
import {GameItem} from "./components/game-item";
import {ScoreBoardSystem} from "./systems/score-board";
import {Direction} from "./components/direction";


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
    return new ECS()
        .buildWorld()
        .withSystem(BallSystem, [InputSystem])
        .withSystem(InputSystem)
        .withSystem(MenuSystem, [InputSystem])
        .withSystem(PaddleSystem, [InputSystem])
        .withSystem(PauseSystem, [InputSystem])
        .withSystem(ScoreBoardSystem)
        .withSystem(ScoreSystem, [InputSystem])
        .withComponents(
            Ball,
            Direction,
            GameItem,
            MenuItem,
            Paddle,
            PauseItem,
            Position,
            ScoreItem,
            UIItem,
        )
        .build();
};

const initGame = (world: IWorld) => {
    const canvasEle = document.querySelector('canvas');
    if (!canvasEle) throw new Error('Could not find canvas element!');

    const renderContext = canvasEle.getContext('2d');
    if (!renderContext) throw new Error('Could not initialize 2D context');

    const canvasBoundingRect = canvasEle.getBoundingClientRect();
    const gameStore = new GameStore();

    canvasEle.width = canvasBoundingRect.width;
    canvasEle.height = canvasBoundingRect.height;

    renderContext.imageSmoothingEnabled = true;
    renderContext.imageSmoothingQuality = 'high';

    gameStore.ctx = renderContext;
    world.addResource(gameStore);
};

const runGame = (world: IWorld) => {
    return world.run({
        afterStepHandler: afterFrameHandler,
        beforeStepHandler: beforeFrameHandler,
        initialState: MenuState,
    });
}

// main function
(async () => {
    const world = createWorld();

    initGame(world);
    await runGame(world);
    cleanup();
})().catch(console.error);
