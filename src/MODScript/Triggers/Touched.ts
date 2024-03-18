import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition } from "../MODscriptDefs";
import { CollisionInfo } from "engine/MessageHandlers";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { ConditionFactory } from "MODScript/_FactoryClasses/ConditionsFactory";
import { GenericCondition, GenericTrigger } from "MODScript/MODscriptGenericCATs";

export class Touched extends GenericTrigger {

    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<Touched>) {
        super(parentEvent);
        this.condition = triggerArgs.condition;
        this.requiresCollision = true;

        if (this.condition)
            this.conditionInstance = ConditionFactory.createCondition(this.condition);

        if (!this.conditionInstance) return;
    }

    checkTrigger(info?: CollisionInfo): { didTrigger: boolean, outputActor: BodyHandle | undefined } {
        let localDidTrigger = false;
        let localOutputActor = undefined;

        if (info) {
            const other = this.parentEvent.InvolvedActorBodies.find((body) => body.body.id === info.getOtherObjectId());
            localDidTrigger = other !== undefined && (this.conditionInstance?.checkConditionOnActor(other, this.parentEvent) ?? false);
            localOutputActor = other;
        }
        return { didTrigger: localDidTrigger, outputActor: localOutputActor };
    }
}
