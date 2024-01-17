import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, MODscriptEvent, Trigger } from "../MODscriptCore";
import { ConditionFactory } from "MODScript/FactoryClasses";
import { HitPoints } from "elements/HitPoints";

export class DamagedTrigger extends Trigger {

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<DamagedTrigger>) {
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