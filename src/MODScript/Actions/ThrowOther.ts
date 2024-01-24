import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { MODscriptStates } from "elements/MODScript States/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class ThrowOther extends GenericAction {
    prefabId: string; //our prefabs are strings?
    actorId: number=-1
    actorName: string = "";
    targetActor: BodyHandle | undefined;

    constructor(eventId:MODscriptEvent, args:Partial<ThrowOther>) {
        super(eventId);
        this.prefabId = args.prefabId ?? "";
        if (args.actorName)
            this.actorName = args.actorName;
        for (const actor of this.parentEvent.InvolvedActorBodies)
            if (actor.body.name === this.actorName) {
                this.actorId = actor.body.id;
                this.targetActor = actor;
            }
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine || !this.targetActor) 
            return;
        
        this.parentEvent.stateMachine.startState(this.ActionId, MODscriptStates.throw, undefined, this.targetActor.body.getPosition());
    }
    
    monitorAction(): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine ) return;
        if(this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if(this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}