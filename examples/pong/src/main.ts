import {buildWorld, IWorld} from "sim-ecs";
import {PaddleSystem} from "./systems/paddle";
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
import {BeforeStepSystem} from "./systems/before-step";
import {PauseState} from "./states/pause";


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
        .withDefaultScheduling(root => root
            .addNewStage(stage => stage.addSystem(BeforeStepSystem))
            .addNewStage(stage => stage.addSystem(InputSystem))
            .addNewStage(stage => stage
                .addSystem(MenuSystem)
                .addSystem(PaddleSystem)
                .addSystem(PauseSystem))
            .addNewStage(stage => stage.addSystem(CollisionSystem))
            .addNewStage(stage => stage.addSystem(BallSystem))
            .addNewStage(stage => stage.addSystem(AnimationSystem))
            .addNewStage(stage => stage
                .addSystem(RenderGameSystem)
                .addSystem(RenderUISystem))
        )
        .withStateScheduling(PauseState, root => root
            .addNewStage(stage => stage.addSystem(BeforeStepSystem))
            .addNewStage(stage => stage.addSystem(InputSystem))
            .addNewStage(stage => stage.addSystem(PauseSystem))
            .addNewStage(stage => stage
                .addSystem(RenderGameSystem)
                .addSystem(RenderUISystem))
        )
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

    canvasEle.width = canvasBoundingRect.width;
    canvasEle.height = canvasBoundingRect.height;

    renderContext.imageSmoothingEnabled = true;
    renderContext.imageSmoothingQuality = 'high';

    world.addResource(GameStore);
    world.addResource(renderContext);
    world.addResource(ScoreBoard);
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
