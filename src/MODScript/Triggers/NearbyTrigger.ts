import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, MODscriptEvent, Trigger } from "../MODscriptCore";
import { ConditionFactory } from "MODScript/FactoryClasses";

export class NearbyTrigger extends Trigger {

    maxDistance: number;
    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<NearbyTrigger>) {
        super(parentEvent);
        this.maxDistance = triggerArgs.maxDistance ?? 0;
        this.condition = triggerArgs.condition;
        if (this.condition)
            this.conditionInstance = ConditionFactory.createCondition(this.condition);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {

        if(this.parentEvent.EventActor === undefined) 
            return { didTrigger: false, outputActor: undefined };

        if (this.conditionInstance) {
            for (let actor of this.parentEvent.InvolvedActors)
                if (this.conditionInstance.checkConditionOnActor(actor))
                    if (actor.body.getPosition().distanceTo(this.parentEvent.EventActor.body.getPosition()) <= this.maxDistance)
                        return { didTrigger: true, outputActor: actor };
        }

        return { didTrigger: false, outputActor: undefined };
    }
}
