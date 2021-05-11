import {ISystemActions, Read, System, SystemData} from "sim-ecs";
import {GameStore} from "../models/game-store";
import {GameState} from "../states/game";
import {PauseState} from "../states/pause";
import {UIItem} from "../components/ui-item";

class Data extends SystemData {
    readonly uiItem = Read(UIItem)
}

export class PauseSystem extends System<Data> {
    readonly SystemDataType = Data;

    gameStore!: GameStore;

    setup(actions: ISystemActions) {
        this.gameStore = actions.getResource(GameStore);
    }

    run(dataSet: Set<Data>) {
        const isGameState = this.gameStore.currentState?.constructor == GameState;
        const isPauseState = this.gameStore.currentState?.constructor == PauseState;

        if (!isGameState && !isPauseState) {
            return;
        }

        if (this.gameStore.input.actions.togglePause) {
            if (isGameState) {
                this.gameStore.PushState = PauseState;
            } else {
                this.gameStore.popState = true;
            }
        }
    }
}
