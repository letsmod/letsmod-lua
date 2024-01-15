import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, MODscriptEvent, Trigger } from "../MODscriptCore";
import { ConditionFactory } from "MODScript/FactoryClasses";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { GameplayScene } from "engine/GameplayScene";

export class TouchedTrigger extends Trigger implements CollisionHandler {

    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;
    didTouch: boolean = false;
    collidedActorId: number = -1;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<TouchedTrigger>) {
        super(parentEvent);
        this.condition = triggerArgs.condition;
        if (this.condition)
            this.conditionInstance = ConditionFactory.createCondition(this.condition);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {

        if (this.conditionInstance) {
            for (let actor of this.parentEvent.InvolvedActors)
                if (this.conditionInstance.checkConditionOnActor(actor))
                    if (actor.body.id === this.collidedActorId) {
                        this.collidedActorId = -1;
                        return { didTrigger: true, outputActor: actor };
                    }
        }
        return { didTrigger: false, outputActor: undefined };
    }

    onCollision(info: CollisionInfo): void {
        this.collidedActorId = info.getOtherObjectId();
    }


}
