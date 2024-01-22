import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, GenericTrigger } from "../MODscriptDefs";
import { HitPoints } from "elements/HitPoints";
import { MODscriptEvent } from "MODScript/MODscriptEvent";

export class DamagedTrigger extends GenericTrigger {

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<DamagedTrigger>)  {
        super(parentEvent);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {
        const actor = this.parentEvent.EventActor;
        if (!actor)
            return { didTrigger: false, outputActor: undefined };
        const hp = actor.getElement(HitPoints);
        if (!hp) {
            console.log("DamagedTrigger: Actor does not have HitPoints element");
            return { didTrigger: false, outputActor: undefined };
        }

        if (hp.hitpoints < hp.maxHitpoints)
            return { didTrigger: true, outputActor: actor };
        else
            return { didTrigger: false, outputActor: undefined };
    }
}