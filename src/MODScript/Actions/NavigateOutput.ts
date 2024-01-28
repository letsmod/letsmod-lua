import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { MODscriptStates } from "elements/MODScript States/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";

export class NavigateOutput extends GenericAction {
    constructor(parentEvent: MODscriptEvent, args: Partial<NavigateOutput>) {
        super(parentEvent);
    }

    //Actor here is the trigger output
    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine) return;

        this.parentEvent.stateMachine.startState(this.ActionId, MODscriptStates.navigate, triggerOutput.body.getPosition(), triggerOutput.body.getPosition());

    }

    monitorAction(): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine) return;
        if (this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if (this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}