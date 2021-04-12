import {GameState} from "./game";
import {ITransitionActions} from "sim-ecs";
import {GameStore} from "../models/game-store";

export class MultiplayerGameState extends GameState {
    constructor() {
        super();
        // todo: add PlayerSystem to this._systems
    }

    activate(actions: ITransitionActions) {
        actions.getResource(GameStore).currentState = this;
    }

    create(actions: ITransitionActions) {
        super.create(actions);
        // todo: add Player components to both paddles
    }
}
