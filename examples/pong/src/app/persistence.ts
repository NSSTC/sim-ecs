import {type ITransitionActions, queryEntities, SerialFormat, type TGroupHandle, WithTag} from "sim-ecs";
import {ScoreBoard} from "../models/score-board.ts";
import {ETags} from "../models/tags.ts";


const saveKey = 'save';

export function load(actions: ITransitionActions): TGroupHandle {
    const save = localStorage.getItem(saveKey);

    if (!save) {
        throw new Error('No save available. Cannot load!');
    }

    return actions.commands.load(SerialFormat.fromJSON(save), {
        replaceResources: true,
    });
}

export function save(actions: ITransitionActions) {
    localStorage.setItem(saveKey, actions.save({
        entities: queryEntities(WithTag(ETags.save)),
        resources: [ScoreBoard],
    }).toJSON());
}
