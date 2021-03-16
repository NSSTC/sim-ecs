export enum EWallType {
    Horizontal,
    Vertical,
}

export enum EWallSide {
    Left,
    None,
    Right,
}

export class Wall {
    constructor(
        public wallType: EWallType,
        public wallSide: EWallSide = EWallSide.None
    ) {}
}
