import {ISystemActions, Read, System, SystemData} from "sim-ecs";
import {UIItem} from "../components/ui-item";
import {EMovement, GameStore} from "../models/game-store";
import {EActions} from "../app/actions";
import {GameState} from "../states/game";

class Data extends SystemData {
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
        // todo: use index
        if (this.gameStore.input.actions.menuMovement == EMovement.down) {
            switch (this.menuAction) {
                case EActions.Play: this.menuAction = EActions.Continue; break;
                case EActions.Continue: this.menuAction = EActions.Exit; break;
                case EActions.Exit: this.menuAction = EActions.Play; break;
                default: {
                    throw new Error(`Action ${this.menuAction} not implemented!`);
                }
            }
        }
        else if (this.gameStore.input.actions.menuMovement == EMovement.up) {
            switch (this.menuAction) {
                case EActions.Play: this.menuAction = EActions.Exit; break;
                case EActions.Continue: this.menuAction = EActions.Play; break;
                case EActions.Exit: this.menuAction = EActions.Continue; break;
                default: {
                    throw new Error(`Action ${this.menuAction} not implemented!`);
                }
            }
        }

        if (this.gameStore.input.actions.menuConfirm) {
            if (this.menuAction == EActions.Play) {
                this.gameStore.PushState = GameState;
            }
            else if (this.menuAction == EActions.Continue) {
                if (localStorage.getItem('save') == null) {
                    return;
                }

                this.gameStore.continue = true;
                this.gameStore.PushState = GameState;
            }
            else {
                this.gameStore.exit = true;
            }

            return;
        }

        for (const {uiItem} of dataSet) {
            uiItem.active = uiItem.action == this.menuAction;
        }
    }
}
