import {IEntity, ISystemActions, System, SystemData, TComponentAccess, With, Write} from "../ecs";
import {Position} from "../components/position";
import {Ball} from "../components/ball";
import {Direction} from "../components/direction";
import {EPaddleSide, Paddle} from "../components/paddle";
import {GameStore} from "../app/game-store";
import {ScoreBoardState} from "../states/score-board";
import {GameItem} from "../components/game-item";

class Data extends SystemData {
    scoreItem = Write(GameItem)
}

export class ScoreSystem extends System<Data> {
    readonly SystemDataType = Data;
    canvasEle!: HTMLCanvasElement;
    ctx!: CanvasRenderingContext2D;
    gameStore!: GameStore
    getEntities!: <C extends Object, T extends TComponentAccess<C>>(query?: T[]) => IterableIterator<IEntity>


    setup(actions: ISystemActions) {
        this.gameStore = actions.getResource(GameStore);
        this.canvasEle = this.gameStore.ctx.canvas;
        this.ctx = this.gameStore.ctx;
        this.getEntities = actions.getEntities;
    }

    scorePoint(scoreItem: GameItem, score: number, ball: Ball, ballPos: Position, ballDir: Direction) {
        scoreItem.score = score;
        if (score == this.gameStore.pointLimit) {
            this.gameStore.PushState = ScoreBoardState;
        }

        ballPos.x = this.canvasEle.width / 2 - ball.size / 2;
        ballDir.x *= -1;
    }

    run(dataSet: Set<Data>) {
        let ballEntity, leftPaddleEntity, rightPaddleEntity;
        let leftScore, rightScore;

        {
            for (const {scoreItem} of dataSet) {
                if (scoreItem.side == EPaddleSide.Left) {
                    leftScore = scoreItem;
                }
                else {
                    rightScore = scoreItem;
                }
            }

            if (!leftScore || !rightScore) throw new Error('Need one score item per side');
        }

        {
            for (const entity of this.getEntities([With(Paddle)])) {
                const paddle = entity.getComponent(Paddle)!;
                if (paddle.side == EPaddleSide.Left) {
                    leftPaddleEntity = entity;
                }
                else {
                    rightPaddleEntity = entity;
                }
            }

            ballEntity = Array.from(this.getEntities([With(Ball)]))[0];
        }

        const ball = ballEntity.getComponent(Ball)!;
        const ballDir = ballEntity.getComponent(Direction)!;
        const ballPos = ballEntity.getComponent(Position)!;

        const leftPaddle = leftPaddleEntity?.getComponent(Paddle)!;
        const leftPaddlePos = leftPaddleEntity?.getComponent(Position)!;
        const rightPaddle = rightPaddleEntity?.getComponent(Paddle)!;
        const rightPaddlePos = rightPaddleEntity?.getComponent(Position)!;

        if (ballPos.x <= 0) {
            this.scorePoint(rightScore, ++this.gameStore.pointsRight, ball, ballPos, ballDir);
        }
        else if (ballPos.x >= this.canvasEle.width) {
            this.scorePoint(leftScore, ++this.gameStore.pointsLeft, ball, ballPos, ballDir);
        }
        else if (ballPos.x <= leftPaddle.width && ballPos.y >= leftPaddlePos.y - ball.size && ballPos.y <= leftPaddlePos.y + leftPaddle.height) {
            ballDir.x *= -1;
        }
        else if (ballPos.x >= this.canvasEle.width - rightPaddle.width && ballPos.y >= rightPaddlePos.y - ball.size && ballPos.y <= rightPaddlePos.y + rightPaddle.height) {
            ballPos.x -= rightPaddle.width;
            ballDir.x *= -1;
        }

        leftScore.draw(this.ctx);
        rightScore.draw(this.ctx);
    }
}
