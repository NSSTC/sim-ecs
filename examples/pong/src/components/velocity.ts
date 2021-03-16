export class Velocity {
    constructor(
        public x = 0,
        public y = 0,
    ) {}

    normalize() {
        const length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.x /= length;
        this.y /= length;
    }
}
