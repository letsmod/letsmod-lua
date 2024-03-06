import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { CharacterStateNames } from "elements/Character State Machines/CharacterStates";
import { MODscriptNavigateState } from "elements/Character State Machines/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";

export class NavigateOther extends GenericAction {
    actorId: number = -1;
    actorName: string = "";
    targetActor: BodyHandle | undefined;
    navigateState: MODscriptNavigateState | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<NavigateOther>) {
        super(parentEvent, CATs.NavigateOther);
        if (args.actorName)
            this.actorName = args.actorName;
        for (const actor of this.parentEvent.InvolvedActorBodies)
            if (actor.body.name === this.actorName) {
                this.actorId = actor.body.id;
                this.targetActor = actor;
            }
        this.navigateState = this.parentEvent.stateMachine?.states[CharacterStateNames.navigate] as MODscriptNavigateState;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine || !this.targetActor) return;
        
        if(this.navigateState === undefined) {
            console.log("No navigate state found")
            this.actionFailed();
            return;
        }

        this.navigateState.setNavigateSpecs(this.targetActor.body.getPosition(), this.targetActor.body.getBoundingSphere().radius, this.parentEvent.Repeatable);
        this.parentEvent.stateMachine.startState(this.ActionId, CharacterStateNames.navigate, this.targetActor.body.getPosition());
    }

    monitorAction(): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine) return;

        if (this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if (this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}