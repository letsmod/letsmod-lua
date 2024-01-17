import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { LookAt } from "elements/LookAt";
import { BodyHandle } from "engine/BodyHandle";

export class LookOutput extends GenericAction {

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