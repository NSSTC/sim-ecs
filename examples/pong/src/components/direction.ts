export class Direction {
    constructor(
        public x = 1,
        public y = 1,
    ) {}

    normalized(): Direction {
        const length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        return new Direction(
            this.x / length,
            this.y / length,
        );
    }
}
