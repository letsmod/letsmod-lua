import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition } from "../MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { ConditionFactory } from "MODScript/_FactoryClasses/ConditionsFactory";
import { GenericCondition, GenericTrigger } from "MODScript/MODscriptGenericCATs";

export class OtherDestroyed extends GenericTrigger {
    maxDistance: number;
    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;
    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<OtherDestroyed>) {
        super(parentEvent);
        this.maxDistance = triggerArgs.maxDistance ?? 0;
        this.condition = triggerArgs.condition;
        if (this.condition)
            this.conditionInstance = ConditionFactory.createCondition(this.condition);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {
        if (this.conditionInstance) {
            for (let actor of this.parentEvent.InvolvedActorBodies) {
                if (this.conditionInstance.checkConditionOnActor(actor, this.parentEvent)) {
                    return actor && !actor.isInScene ? { didTrigger: true, outputActor: actor } : { didTrigger: false, outputActor: undefined };
                }
            }
        }

        return { didTrigger: false, outputActor: undefined };
    }
}