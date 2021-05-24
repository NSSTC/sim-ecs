import {ITransitionActions, SerialFormat} from "sim-ecs";
import {ScoreBoard} from "../models/score-board";


const saveKey = 'save';
const scoreSaveKey = 'saveScore';

export function load(actions: ITransitionActions) {
    const save = localStorage.getItem(saveKey);
    const scoreSave = localStorage.getItem(scoreSaveKey);
    const scoreBoard = actions.getResource(ScoreBoard);

    if (!save || !scoreSave) {
        throw new Error('No save available. Cannot load!');
    }

    const score = JSON.parse(scoreSave);

    actions.clearEntities();
    actions.load(SerialFormat.fromJSON(save));
    scoreBoard.left = score.left;
    scoreBoard.right = score.right;
    actions.maintain();
}

export function save(actions: ITransitionActions) {
    localStorage.setItem(saveKey, actions.save().toJSON());
    localStorage.setItem(scoreSaveKey, JSON.stringify(actions.getResource(ScoreBoard)));
}
