import {Transform} from "./transform.ts";

export class PaddleTransforms {
    constructor(
        public left: Transform,
        public right: Transform,
    ) {}
}
