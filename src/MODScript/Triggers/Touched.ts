import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, GenericTrigger} from "../MODscriptDefs";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { ConditionFactory } from "MODScript/FactoryClasses/ConditionsFactory";

export class Touched extends GenericTrigger implements CollisionHandler {

    condition: ConditionDefinition | undefined;
    conditionInstance: GenericCondition | undefined;
    didTouch: boolean = false;
    collidedActorId: number = -1;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<Touched>) {
        super(parentEvent);
        this.condition = triggerArgs.condition;
        if (this.condition)
            this.conditionInstance = ConditionFactory.createCondition(this.condition);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {

        if (this.conditionInstance) {
            for (let actor of this.parentEvent.InvolvedActorBodies)
                if (this.conditionInstance.checkConditionOnActor(actor,this.parentEvent))
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
