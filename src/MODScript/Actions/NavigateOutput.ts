import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { MODscriptStates } from "elements/MODScript States/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";

export class NavigateOutput extends GenericAction {
    constructor(eventId: MODscriptEvent, args: Partial<NavigateOutput>) {
        super(eventId);
    }

    //Actor here is the trigger output
    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine ) return;

        this.parentEvent.stateMachine.startState(this.ActionId, MODscriptStates.Navigate, triggerOutput.body.getPosition(), triggerOutput.body.getPosition());
        if(this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}