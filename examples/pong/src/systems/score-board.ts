import {ISystemActions, Read, System, SystemData, With} from "sim-ecs";
import {ScoreItem} from "../components/_markers";
import {UIItem} from "../components/ui-item";
import {GameStore} from "../models/game-store";

export class Data extends SystemData {
    _scoreItem = With(ScoreItem)
    uiItem = Read(UIItem)
}

export class ScoreBoardSystem extends System<Data> {
    SystemDataType = Data;
    gameStore!: GameStore;

    setup(actions: ISystemActions): void | Promise<void> {
        this.gameStore = actions.getResource(GameStore);
    }

    run(dataSet: Set<Data>) {
        for (const {uiItem} of dataSet) {
            uiItem.draw(this.gameStore.ctx);
        }
    }
}
