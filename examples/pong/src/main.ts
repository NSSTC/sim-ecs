import {ECS, IWorld} from "./ecs";
import {PaddleSystem} from "./systems/paddle";
import {afterFrameStep, beforeFrameStep} from "./app/frame-transition-handlers";
import {InputSystem} from "./systems/input";
import {GameStore} from "./app/game-store";
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


const cleanup = async (_world: IWorld) => {
    const canvasEle = document.querySelector('canvas');
    if (!canvasEle) throw new Error('Could not find canvas element!');

    const parentEle = canvasEle.parentElement!;
    const textEle = document.createElement('strong');

    parentEle.removeChild(canvasEle);
    textEle.innerText = 'Game Ended!';
    parentEle.appendChild(textEle);
};

const createWorld = () => {
    const ecs = new ECS();
    return ecs
        .buildWorld()
        .withSystem(BallSystem, [InputSystem])
        .withSystem(InputSystem)
        .withSystem(MenuSystem, [InputSystem])
        .withSystem(PaddleSystem, [InputSystem])
        .withSystem(PauseSystem, [InputSystem])
        .withSystem(ScoreBoardSystem) // todo: throw if a system was not registered but is supposed to run
        .withSystem(ScoreSystem, [InputSystem])
        .withComponent(Ball)
        .withComponent(GameItem)
        .withComponent(MenuItem)
        .withComponent(Paddle)
        .withComponent(PauseItem)
        .withComponent(Position)
        .withComponent(ScoreItem)
        .withComponent(UIItem)
        .build();
};

const initGame = async (world: IWorld) => {
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

const runGame = async (world: IWorld) => {
    return world.run({
        afterStepHandler: afterFrameStep,
        beforeStepHandler: beforeFrameStep,
        initialState: MenuState,
    }).catch(console.error);
}

// main function
(async () => {
    const world = createWorld();

    await initGame(world);
    await runGame(world);
    await cleanup(world);
})();

// todo: find a way to fix the problem of optimizers destroying constructor names
