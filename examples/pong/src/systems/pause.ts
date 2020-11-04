import {ISystemActions, Read, System, SystemData, With} from "../ecs";
import {GameStore} from "../app/game-store";
import {GameState} from "../states/game";
import {PauseState} from "../states/pause";
import {PauseItem} from "../components/_markers";
import {UIItem} from "../components/ui-item";

class Data extends SystemData {
    _pauseItem = With(PauseItem)
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
        else if (isPauseState) {
            for (const {uiItem} of dataSet) {
                uiItem.draw(this.gameStore.ctx);
            }
        }

        if (this.gameStore.input.actions.togglePause) {
            if (isGameState) {
                this.gameStore.pushState = new PauseState();
            }
            else {
                this.gameStore.popState = true;
            }
        }
    }
}
