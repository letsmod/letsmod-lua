import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, GenericTrigger } from "../MODscriptDefs";
import { HitPoints } from "elements/HitPoints";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { ConditionFactory } from "MODScript/FactoryClasses/ConditionsFactory";

export class OtherDestroyedTrigger extends GenericTrigger {
    maxDistance: number;
    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;
    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<OtherDestroyedTrigger>) {
        super(parentEvent);
        this.maxDistance = triggerArgs.maxDistance ?? 0;
        if (this.condition)
             this.conditionInstance = ConditionFactory.createCondition(this.condition);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {

        if (this.conditionInstance) {
            for (let actor of this.parentEvent.InvolvedActorBodies)
                if (this.conditionInstance.checkConditionOnActor(actor,this.parentEvent))
                    return actor && !actor.isInScene ? { didTrigger: true, outputActor: actor } : { didTrigger: false, outputActor: undefined };
        }

        return { didTrigger: false, outputActor: undefined };
    }
}