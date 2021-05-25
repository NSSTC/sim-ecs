import {ITransitionActions, SerialFormat, TPrefabHandle, WithTag} from "sim-ecs";
import {ScoreBoard} from "../models/score-board";
import {ETags} from "../models/tags";


const saveKey = 'save';
const scoreSaveKey = 'saveScore';

export function load(actions: ITransitionActions): TPrefabHandle {
    const save = localStorage.getItem(saveKey);
    const scoreSave = localStorage.getItem(scoreSaveKey);
    const scoreBoard = actions.getResource(ScoreBoard);

    if (!save || !scoreSave) {
        throw new Error('No save available. Cannot load!');
    }

    const score = JSON.parse(scoreSave);

    const handle = actions.load(SerialFormat.fromJSON(save));
    scoreBoard.left = score.left;
    scoreBoard.right = score.right;

    return handle;
}

export function save(actions: ITransitionActions) {
    localStorage.setItem(saveKey, actions.save([WithTag(ETags.save)]).toJSON());
    localStorage.setItem(scoreSaveKey, JSON.stringify(actions.getResource(ScoreBoard)));
}
