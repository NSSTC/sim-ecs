export enum EPaddleSide {
    Left,
    Right,
}

export class Paddle {
    constructor(
        public color: string,
        public height: number,
        public side: EPaddleSide,
        public width: number,
    ) {}

    draw(ctx: CanvasRenderingContext2D, yPos: number) {
        const x = this.side == EPaddleSide.Left
            ? 0
            : ctx.canvas.width - this.width;

        ctx.fillStyle = this.color;
        ctx.fillRect(x, yPos, this.width, this.height);
    }
}
