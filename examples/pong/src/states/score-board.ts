import {ITransitionActions, State, TPrefabHandle, With} from "sim-ecs";
import {scorePrefab} from "../prefabs/score";
import {UIItem} from "../components/ui-item";
import {ScoreBoard} from "../models/score-board";
import {GameStore} from "../models/game-store";

export class ScoreBoardState extends State {
    prefabHandle!: TPrefabHandle;

    activate(actions: ITransitionActions) {
        actions.getResource(GameStore).currentState = this;
    }

    create(actions: ITransitionActions) {
        const score = actions.getResource(ScoreBoard);
        let uiItem;

        this.prefabHandle = actions.loadPrefab(scorePrefab);/*
        for (const entity of actions.getEntities([With(ScoreItem)])) {
            uiItem = entity.getComponent(UIItem)!;
            uiItem.caption = uiItem.caption
                .replace('{side}', score.left == 10 ? 'Left' : 'Right')
                .replace('{score}', score.left + ':' + score.right);
        }
        */
        actions.maintain();
    }

    destroy(actions: ITransitionActions): void | Promise<void> {
        actions.unloadPrefab(this.prefabHandle);
    }
}
