import {ISystemActions, Read, System, SystemData, With} from "../ecs";
import {UIItem} from "../components/ui-item";
import {EMovement, GameStore} from "../app/game-store";
import {EActions} from "../app/actions";
import {GameState} from "../states/game";
import {MenuItem} from "../components/_markers";

class Data extends SystemData {
    _menuItem = With(MenuItem)
    readonly uiItem = Read(UIItem)
}

export class MenuSystem extends System<Data> {
    readonly SystemDataType = Data;
    gameStore!: GameStore;
    menuAction = EActions.Play;

    setup(actions: ISystemActions) {
        this.gameStore = actions.getResource(GameStore);
    }

    run(dataSet: Set<Data>) {
        if (this.gameStore.input.actions.menuMovement != EMovement.halt) {
            this.menuAction = this.menuAction == EActions.Play
                ? EActions.Exit
                : EActions.Play;
        }

        for (const {uiItem} of dataSet) {
            uiItem.draw(this.gameStore.ctx, uiItem.action === this.menuAction);
        }

        if (this.gameStore.input.actions.menuConfirm) {
            if (this.menuAction == EActions.Play) {
                this.gameStore.PushState = GameState;
            }
            else {
                this.gameStore.exit = true;
            }
        }
    }
}
