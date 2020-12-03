import {ITransitionActions, State, TPrefabHandle, With} from "../ecs";
import {scorePrefab} from "../prefabs/score";
import {ScoreItem} from "../components/_markers";
import {UIItem} from "../components/ui-item";
import {GameStore} from "../models/game-store";
import {ScoreBoardSystem} from "../systems/score-board";

export class ScoreBoardState extends State {
    _systems = [ScoreBoardSystem];
    prefabHandle!: TPrefabHandle;

    create(actions: ITransitionActions) {
        const gameStore = actions.getResource(GameStore);
        let uiItem;

        this.prefabHandle = actions.loadPrefab(scorePrefab);
        for (const entity of actions.getEntities([With(ScoreItem)])) {
            uiItem = entity.getComponent(UIItem)!;
            uiItem.caption = uiItem.caption
                .replace('{side}', gameStore.pointsLeft == 10 ? 'Left' : 'Right')
                .replace('{score}', gameStore.pointsLeft + ':' + gameStore.pointsRight);
        }

        actions.maintain();
    }

    destroy(actions: ITransitionActions): void | Promise<void> {
        actions.unloadPrefab(this.prefabHandle);
    }
}
