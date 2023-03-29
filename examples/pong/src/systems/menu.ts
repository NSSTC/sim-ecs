import {Actions, createSystem, hmrSwapSystem, queryComponents, Storage, Write, WriteResource} from "sim-ecs";
import {UIItem} from "../components/ui-item.ts";
import {EMovement, GameStore} from "../models/game-store.ts";
import {EActions} from "../app/actions.ts";
import {GameState} from "../states/game.ts";


export const MenuSystem = createSystem({
    actions: Actions,
    gameStore: WriteResource(GameStore),
    storage: Storage({ menuAction: EActions.Play }),
    query: queryComponents({
        uiItem: Write(UIItem)
    }),
})
    .withName('MenuSystem')
    .withRunFunction(({actions, gameStore, storage, query}) => {
        // todo: use index
        if (gameStore.input.actions.menuMovement == EMovement.down) {
            switch (storage.menuAction) {
                case EActions.Play: storage.menuAction = EActions.Continue; break;
                case EActions.Continue: storage.menuAction = EActions.Exit; break;
                case EActions.Exit: storage.menuAction = EActions.Play; break;
                default: {
                    throw new Error(`Action ${storage.menuAction} not implemented!`);
                }
            }
        }
        else if (gameStore.input.actions.menuMovement == EMovement.up) {
            switch (storage.menuAction) {
                case EActions.Play: storage.menuAction = EActions.Exit; break;
                case EActions.Continue: storage.menuAction = EActions.Play; break;
                case EActions.Exit: storage.menuAction = EActions.Continue; break;
                default: {
                    throw new Error(`Action ${storage.menuAction} not implemented!`);
                }
            }
        }

        if (gameStore.input.actions.menuConfirm) {
            if (storage.menuAction == EActions.Play) {
                actions.commands.pushState(GameState);
            }
            else if (storage.menuAction == EActions.Continue) {
                if (localStorage.getItem('save') == null) {
                    return;
                }

                gameStore.continue = true;
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

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
