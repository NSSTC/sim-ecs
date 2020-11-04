import {Position} from "./position";

export class Ball {
    constructor(
        public color: string,
        public size: number,
    ) {}

    draw(ctx: CanvasRenderingContext2D, pos: Position) {
        ctx.fillStyle = this.color;
        ctx.fillRect(pos.x, pos.y, this.size, this.size);
    }
}
