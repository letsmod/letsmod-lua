import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { LookAt } from "elements/LookAt";
import { MODscriptStates } from "elements/MODScript States/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";

export class LookOutput extends GenericAction {

    constructor(parentEvent:MODscriptEvent, args:Partial<LookOutput>) {
        super(parentEvent);
    }

    //Actor here is the trigger output
    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine) return;

        ///////

    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}