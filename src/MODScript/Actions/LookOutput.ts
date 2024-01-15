import { Action, MODscriptEvent } from "MODScript/MODscriptCore";
import { LookAt } from "elements/LookAt";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class LookOutput extends Action {

    constructor(eventId:MODscriptEvent, args:Partial<LookOutput>) {
        super(eventId);
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;

        const lookAtElement = this.parentEvent.EventActor.getElement(LookAt);
        if(!lookAtElement) {
            console.log("LookOutput: actor does not have a LookAt element")
            return;
        }

        lookAtElement.changeTargetByBodyId(triggerOutput.body.id);
        this.actionFinished();
    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}