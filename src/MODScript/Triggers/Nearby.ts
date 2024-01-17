import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, MODscriptEvent, Trigger } from "../MODscriptCore";
import { ConditionFactory } from "MODScript/FactoryClasses";

export class Nearby extends Trigger {

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

        if (this.conditionInstance) {
            for (let actor of this.parentEvent.InvolvedActors)
                if (this.conditionInstance.checkConditionOnActor(actor))
                    return { didTrigger: true, outputActor: actor };
        }

        return { didTrigger: false, outputActor: undefined };
    }
}
