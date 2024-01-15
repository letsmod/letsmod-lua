import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, MODscriptEvent, Trigger } from "../MODscriptCore";
import { ConditionFactory } from "MODScript/FactoryClasses";

export class HearTrigger extends Trigger {

    maxDistance: number;
    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<HearTrigger>) {
        super(parentEvent);
        this.maxDistance = triggerArgs.maxDistance ?? 0;
        this.condition = triggerArgs.condition;
        if (this.condition)
            this.conditionInstance = ConditionFactory.createCondition(this.condition);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {

        if (this.conditionInstance) {
            for (let actor of this.parentEvent.InvolvedActors)
                if (this.conditionInstance.checkConditionOnActor(actor))
                    if (actor.body.getPosition().distanceTo(this.parentEvent.InvolvedActors[0].body.getPosition()) <= this.maxDistance)
                        //todo add hearing check
                        return { didTrigger: true, outputActor: actor };
        }

        return { didTrigger: false, outputActor: undefined };
    }
}
