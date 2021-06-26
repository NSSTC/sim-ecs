import {ECS, IWorld} from "sim-ecs";
import {PaddleSystem} from "./systems/paddle";
import {beforeFrameHandler} from "./app/frame-transition-handlers";
import {InputSystem} from "./systems/input";
import {GameStore} from "./models/game-store";
import {MenuState} from "./states/menu";
import {UIItem} from "./components/ui-item";
import {MenuSystem} from "./systems/menu";
import {PauseSystem} from "./systems/pause";
import {Paddle} from "./components/paddle";
import {Position} from "./components/position";
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
import {Wall} from "./components/wall";


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
        .withSystem(BallSystem, [CollisionSystem])
        .withSystem(CollisionSystem, [PaddleSystem])
        .withSystem(InputSystem)
        .withSystem(MenuSystem, [InputSystem])
        .withSystem(PaddleSystem, [InputSystem])
        .withSystem(PauseSystem, [InputSystem])
        .withSystem(RenderGameSystem, [AnimationSystem, BallSystem, PaddleSystem])
        .withSystem(RenderUISystem, [AnimationSystem, MenuSystem, PauseSystem])
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
        beforeStepHandler: beforeFrameHandler,
        initialState: MenuState,
    });
}

// main function
(async () => {
    const world = createWorld();

    if (localStorage.getItem('dev') === 'true') {
        // @ts-ignore
        window.world = world;
    }

    initGame(world);
    await runGame(world);
    cleanup();
})().catch(console.error);
