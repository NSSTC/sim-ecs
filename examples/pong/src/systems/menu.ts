import {Actions, createSystem, Query, Storage, Write} from "sim-ecs";
import {UIItem} from "../components/ui-item";
import {EMovement, GameStore} from "../models/game-store";
import {EActions} from "../app/actions";
import {GameState} from "../states/game";
import {MenuState} from "../states/menu";


export const MenuSystem = createSystem(
    Actions,
    Storage<{ gameStore: GameStore, menuAction: EActions }>(),
    new Query({
        uiItem: Write(UIItem)
    }),
)
    .runInStates(MenuState)
    .withSetupFunction((actions, storage) => {
        storage.gameStore = actions.getResource(GameStore);
        storage.menuAction = EActions.Play;
    })
    .withRunFunction((actions, storage, query) => {
        // todo: use index
        if (storage.gameStore.input.actions.menuMovement == EMovement.down) {
            switch (storage.menuAction) {
                case EActions.Play: storage.menuAction = EActions.Continue; break;
                case EActions.Continue: storage.menuAction = EActions.Exit; break;
                case EActions.Exit: storage.menuAction = EActions.Play; break;
                default: {
                    throw new Error(`Action ${storage.menuAction} not implemented!`);
                }
            }
        }
        else if (storage.gameStore.input.actions.menuMovement == EMovement.up) {
            switch (storage.menuAction) {
                case EActions.Play: storage.menuAction = EActions.Exit; break;
                case EActions.Continue: storage.menuAction = EActions.Play; break;
                case EActions.Exit: storage.menuAction = EActions.Continue; break;
                default: {
                    throw new Error(`Action ${storage.menuAction} not implemented!`);
                }
            }
        }

        if (storage.gameStore.input.actions.menuConfirm) {
            if (storage.menuAction == EActions.Play) {
                actions.commands.pushState(GameState);
            }
            else if (storage.menuAction == EActions.Continue) {
                if (localStorage.getItem('save') == null) {
                    return;
                }

                storage.gameStore.continue = true;
                actions.commands.pushState(GameState);
            }
            else {
                actions.commands.stopRun();
            }

            return;
        }

        for (const {uiItem} of query.iter()) {
            uiItem.active = uiItem.action == storage.menuAction;
        }
    })
    .build();
