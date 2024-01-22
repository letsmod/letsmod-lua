import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, GenericTrigger } from "../MODscriptDefs";
import { HitPoints } from "elements/HitPoints";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { ConditionFactory } from "MODScript/FactoryClasses/ConditionsFactory";

export class OtherDamaged extends GenericTrigger {
    maxDistance: number;
    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;
    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<OtherDamaged>) {
        super(parentEvent);
        this.maxDistance = triggerArgs.maxDistance ?? 0;
        this.condition = triggerArgs.condition;
        if (this.condition)
            this.conditionInstance = ConditionFactory.createCondition(this.condition);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {


        if (this.conditionInstance) {
            for (let actor of this.parentEvent.InvolvedActorBodies){
                const hp = actor.getElement(HitPoints);
                if (!hp) {
                    console.log("DamagedTrigger: Actor does not have HitPoints element");
                    return { didTrigger: false, outputActor: undefined };
                }
                if (hp.hitpoints < hp.maxHitpoints)
                return actor ? { didTrigger: true, outputActor: actor } : { didTrigger: false, outputActor: undefined };
            }
        }

        return { didTrigger: false, outputActor: undefined };
    }
}