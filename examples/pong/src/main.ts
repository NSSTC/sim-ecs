import {ECS, IWorld} from "sim-ecs";
import {PaddleSystem} from "./systems/paddle";
import {afterFrameHandler, beforeFrameHandler} from "./app/frame-transition-handlers";
import {InputSystem} from "./systems/input";
import {GameStore} from "./models/game-store";
import {MenuState} from "./states/menu";
import {UIItem} from "./components/ui-item";
import {MenuSystem} from "./systems/menu";
import {PauseSystem} from "./systems/pause";
import {Paddle} from "./components/paddle";
import {Position} from "./components/position";
import {Ball} from "./components/ball";
import {BallSystem} from "./systems/ball";
import {Velocity} from "./components/velocity";
import {RenderUISystem} from "./systems/render-ui";
import {RenderGameSystem} from "./systems/render-game";
import {Shape} from "./components/shape";
import {AnimationSystem} from "./systems/animation";
import {ScoreBoard} from "./models/score-board";
import {PaddleTransforms} from "./models/paddle-transforms";
import {Dimensions} from "./models/dimensions";
import {CollisionSystem} from "./systems/collision";
import {Collision} from "./components/collision";
import { Wall } from "./components/wall";


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
        .withSystem(AnimationSystem, [BallSystem, PaddleSystem])
        .withSystem(BallSystem, [CollisionSystem, InputSystem, PaddleSystem])
        .withSystem(CollisionSystem, [InputSystem])
        .withSystem(InputSystem)
        .withSystem(MenuSystem, [InputSystem])
        .withSystem(PaddleSystem, [InputSystem])
        .withSystem(PauseSystem, [InputSystem])
        .withSystem(RenderGameSystem, [AnimationSystem, BallSystem, PaddleSystem])
        .withSystem(RenderUISystem, [AnimationSystem, MenuSystem, PauseSystem])
        .withComponents(
            Ball,
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

    world.addResource(renderContext);
    world.addResource(ScoreBoard);
    world.addResource(gameStore);
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
