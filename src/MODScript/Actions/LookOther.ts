import { Action, MODscriptEvent } from "MODScript/MODscriptCore";
import { LookAt } from "elements/LookAt";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class LookOther extends Action {
    actorId: number;

    constructor(eventId:MODscriptEvent, args:Partial<LookOther>) {
        super(eventId);
        this.actorId = args.actorId ?? 0;
    }
//todo AHMAD: this needs tobecome a state instead of accessing the element
    performAction(triggerOutput?: BodyHandle | undefined): void {
        const actor = GameplayScene.instance.getBodyById(this.actorId);
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor||!actor) return;

        const lookAtElement = this.parentEvent.EventActor.getElement(LookAt);
        if(!lookAtElement) {
            console.log("LookOther: actor does not have a LookAt element")
            return;
        }

        lookAtElement.changeTargetByBodyId(this.actorId);
        this.actionFinished();
    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}