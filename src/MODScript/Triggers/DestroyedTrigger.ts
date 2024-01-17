import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, MODscriptEvent, Trigger } from "../MODscriptCore";
import { ConditionFactory } from "MODScript/FactoryClasses";
import { HitPoints } from "elements/HitPoints";

export class DestroyedTrigger extends Trigger {

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<DestroyedTrigger>) {
        super(parentEvent);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {
        const actor = this.parentEvent.EventActor;
        return actor && !actor.isInScene ? { didTrigger: true, outputActor: actor } : { didTrigger: false, outputActor: undefined };
    }
}