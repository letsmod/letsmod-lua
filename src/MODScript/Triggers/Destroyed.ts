import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, GenericTrigger } from "../MODscriptDefs";
import { HitPoints } from "elements/HitPoints";
import { MODscriptEvent } from "MODScript/MODscriptEvent";

export class DestroyedTrigger extends GenericTrigger {

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<DestroyedTrigger>) {
        super(parentEvent);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {
        const actor = this.parentEvent.EventActor;
        return actor && !actor.isInScene ? { didTrigger: true, outputActor: actor } : { didTrigger: false, outputActor: undefined };
    }
}