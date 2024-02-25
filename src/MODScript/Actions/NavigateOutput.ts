import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { CharacterStates } from "elements/Character State Machines/CharacterStates";
import { MODscriptNavigateState } from "elements/Character State Machines/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";

export class NavigateOutput extends GenericAction {

    navigateState: MODscriptNavigateState | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<NavigateOutput>) {
        super(parentEvent, CATs.NavigateOutput);
        this.navigateState = this.parentEvent.stateMachine?.states[CharacterStates.navigate] as MODscriptNavigateState;

    }

    //Actor here is the trigger output
    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine) return;

        if(this.navigateState === undefined) {
            console.log("No navigate state found")
            this.actionFailed();
            return;
        }

        this.navigateState.setNavTarget(triggerOutput.body.getPosition());
        this.parentEvent.stateMachine.startState(this.ActionId, CharacterStates.navigate, triggerOutput.body.getPosition());

    }

    monitorAction(): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine) return;
        if (this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if (this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}