import { Action, GenericAction, MODscriptEvent } from "MODScript/MODscriptCore";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class ThrowOther extends Action {
    prefabId: number
    actorId: number;

    constructor(eventId:MODscriptEvent, args:Partial<ThrowOther>) {
        super(eventId);
        this.prefabId = args.prefabId ?? 0;
        this.actorId = args.actorId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) 
            return;

        const targetActor = GameplayScene.instance.getBodyById(this.actorId);
        if (!targetActor) 
            return;

        const targetPos = targetActor.body.getPosition().clone();

        this.actionFinished();
    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}