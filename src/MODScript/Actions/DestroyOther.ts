import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class DestroyOther extends GenericAction {
    actorId: number;
    
    constructor(eventId: MODscriptEvent, args: Partial<DestroyOther>) {
        super(eventId);
        this.actorId = args.actorId ?? -1;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;

        const targetActor = this.parentEvent.getInvolvedActor(this.actorId);
        if (targetActor){
            GameplayScene.instance.destroyBody(targetActor);
            this.actionFinished();
        }
        else{
            console.log('Cannot find actor with id ' + this.actorId + ' in scene');
            this.actionFailed();
        }

    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}