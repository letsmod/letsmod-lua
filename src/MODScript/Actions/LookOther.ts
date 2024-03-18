import { CATs } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { GenericAction } from "MODScript/MODscriptGenericCATs";
import { CharacterStateNames } from "elements/Character State Machines/CharacterStates";

import { BodyHandle } from "engine/BodyHandle";

export class LookOther extends GenericAction {
    actorId: number = -1;
    actorName: string = "";
    targetActor: BodyHandle | undefined;

    constructor(parentEvent:MODscriptEvent, args:Partial<LookOther>) {
        super(parentEvent, CATs.LookOther);
        if (args.actorName)
            this.actorName = args.actorName;
        for (const actor of this.parentEvent.InvolvedActorBodies)
            if (actor.body.name === this.actorName) {
                this.actorId = actor.body.id;
                this.targetActor = actor;
            }

    }
//todo AHMAD: this needs tobecome a state instead of accessing the element
    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!this.parentEvent || !this.parentEvent.stateMachine|| ! this.targetActor) return;

        this.parentEvent.stateMachine.startState(this.ActionId, CharacterStateNames.lookAt, this.targetActor.body.getPosition());
        
    }
    
    monitorAction(): void {
        if(!this.parentEvent || !this.parentEvent.stateMachine) return;
        if(this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if(this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}