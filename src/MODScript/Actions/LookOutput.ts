import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { MODscriptStates } from "elements/MODScript States/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";

export class LookOutput extends GenericAction {

    constructor(parentEvent:MODscriptEvent, args:Partial<LookOutput>) {
        super(parentEvent);
    }

    //Actor here is the trigger output
    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine) return;

        this.parentEvent.stateMachine.startState(this.ActionId, MODscriptStates.lookAt, undefined, triggerOutput.body.getPosition());
        if(this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if(this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();

    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}