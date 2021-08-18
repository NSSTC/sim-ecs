import {ISystemActions, Query, System, Write} from "sim-ecs";
import {UIItem} from "../components/ui-item";
import {EMovement, GameStore} from "../models/game-store";
import {EActions} from "../app/actions";
import {GameState} from "../states/game";
import {MenuState} from "../states/menu";


export class MenuSystem extends System {
    readonly query = new Query({
        uiItem: Write(UIItem)
    });
    readonly states = [MenuState];

    actions!: ISystemActions
    gameStore!: GameStore;
    menuAction = EActions.Play;

    setup(actions: ISystemActions) {
        this.actions = actions;
        this.gameStore = actions.getResource(GameStore);
    }

    run(actions: ISystemActions) {
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
                this.actions.commands.pushState(GameState);
            }
            else if (this.menuAction == EActions.Continue) {
                if (localStorage.getItem('save') == null) {
                    return;
                }

                this.gameStore.continue = true;
                this.actions.commands.pushState(GameState);
            }
            else {
                this.actions.commands.stopRun();
            }

            return;
        }

        for (const {uiItem} of this.query.iter()) {
            uiItem.active = uiItem.action == this.menuAction;
        }
    }
}
