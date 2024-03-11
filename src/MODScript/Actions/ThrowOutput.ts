import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { CharacterStateNames } from "elements/Character State Machines/CharacterStates";
import { MODscriptThrowState } from "elements/Character State Machines/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class ThrowOutput extends GenericAction {
    prefabId: string;
    throwState: MODscriptThrowState | undefined;


    constructor(parentEvent: MODscriptEvent, args: Partial<ThrowOutput>) {
        super(parentEvent, CATs.ThrowOutput);
        this.prefabId = args.prefabId ?? "";
        this.throwState = this.parentEvent.stateMachine?.states[CharacterStateNames.throw] as MODscriptThrowState;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine)
            return;

        if (this.throwState === undefined) {
            console.log("No throw state found")
            this.actionFailed();
            return;
        }
        this.throwState.setThrowablePrefab(this.prefabId);
        this.parentEvent.stateMachine.startState(this.ActionId, CharacterStateNames.throw, triggerOutput.body.getPosition());
    }

    monitorAction(): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine) return;
        if (this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if (this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}