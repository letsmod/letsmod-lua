import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { CharacterStateNames } from "elements/Character State Machines/CharacterStates";
import { MODscriptNavigateState } from "elements/Character State Machines/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";

export class NavigateOutput extends GenericAction {

    navigateState: MODscriptNavigateState | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<NavigateOutput>) {
        super(parentEvent, CATs.NavigateOutput);
        this.navigateState = this.parentEvent.stateMachine?.states[CharacterStateNames.navigate] as MODscriptNavigateState;

    }

    //Actor here is the trigger output
    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine) return;

        if(this.navigateState === undefined) {
            console.log("No navigate state found")
            this.actionFailed();
            return;
        }

        this.navigateState.setNavigateSpecs(triggerOutput.body.getPosition(), triggerOutput.body.getBoundingSphere().radius,this.parentEvent.Repeatable);
        this.parentEvent.stateMachine.startState(this.ActionId, CharacterStateNames.navigate, triggerOutput.body.getPosition());

    }

    monitorAction(): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine) return;
        if (this.parentEvent.stateMachine.stateIsComplete(this.ActionId) && !this.parentEvent.Repeatable)
            this.actionFinished();
        else if (this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}