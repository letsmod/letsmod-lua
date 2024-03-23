import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, GenericTrigger } from "../MODscriptDefs";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { ConditionFactory } from "MODScript/FactoryClasses/ConditionsFactory";
import { GameplayScene } from "engine/GameplayScene";

export class Touched extends GenericTrigger {

    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<Touched>) {
        super(parentEvent);
        this.condition = triggerArgs.condition;
        this.isCollisionListener = true;

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
