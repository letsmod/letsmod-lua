import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, GenericTrigger,  } from "../MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { ConditionFactory } from "MODScript/FactoryClasses/ConditionsFactory";

export class Nearby extends GenericTrigger {

    maxDistance: number;
    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<Nearby>) {
        super(parentEvent);
        this.maxDistance = triggerArgs.maxDistance ?? 0;
        this.condition = triggerArgs.condition;
        if (this.condition)
            this.conditionInstance = ConditionFactory.createCondition(this.condition);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {
        if (!this.parentEvent || !this.parentEvent.EventActor) return { didTrigger: false, outputActor: undefined };
        if (this.conditionInstance) {
            for (let actor of this.parentEvent.InvolvedActorBodies)
                if (this.conditionInstance.checkConditionOnActor(actor, this.parentEvent)){
                    if (actor.body.getPosition().distanceTo(this.parentEvent.EventActor.body.getPosition()) <= this.maxDistance){
                        return { didTrigger: true, outputActor: actor };
                    }
                }
        }

        return { didTrigger: false, outputActor: undefined };
    }
}