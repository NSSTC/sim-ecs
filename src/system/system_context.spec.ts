import type {IRuntimeWorld} from "../world/runtime/runtime-world.spec.ts";
import type {SimECSEvent} from "../events/internal-events.ts";
import type {TTypeProto} from "../_.spec.ts";
import type {TSubscriber} from "../events/_.ts";

/** @internal */
export interface ISystemContext {
    /** @internal */
    _context: IRuntimeWorld | undefined
    /** @internal */
    _handlers: Map<TTypeProto<SimECSEvent>, TSubscriber<TTypeProto<SimECSEvent>>>
}
