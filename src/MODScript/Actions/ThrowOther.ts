import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { ThrowState } from "elements/AdventurerAvatar";
import { CharacterStateNames } from "elements/Character State Machines/CharacterStates";
import { MODscriptThrowState } from "elements/Character State Machines/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class ThrowOther extends GenericAction {
    prefabId: string;
    actorName: string = "";
    actorId: number = -1
    throwState: MODscriptThrowState | undefined;
    private targetActor: BodyHandle | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<ThrowOther>) {
        super(parentEvent, CATs.ThrowOther);
        this.prefabId = args.prefabId ?? "";
        
        if (args.actorName)
            this.actorName = args.actorName;
        for (const actor of this.parentEvent.InvolvedActorBodies)
            if (actor.body.name === this.actorName) {
                this.actorId = actor.body.id;
                this.targetActor = actor;
            }
        this.throwState = this.parentEvent.stateMachine?.states[CharacterStateNames.throw] as MODscriptThrowState;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine || !this.targetActor)
            return;
        if(this.throwState === undefined) {
            console.log("No throw state found")
            this.actionFailed();
            return;
        }
        this.throwState.setThrowablePrefab(this.prefabId);

        this.parentEvent.stateMachine.startState(this.ActionId, CharacterStateNames.throw, this.targetActor.body.getPosition());
    }



    monitorAction(): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine) return;
        if (this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if (this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}