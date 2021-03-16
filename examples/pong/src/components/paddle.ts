export enum EPaddleSide {
    Left,
    Right,
}

export class Paddle {
    constructor(
        public side: EPaddleSide,
    ) {}
}
