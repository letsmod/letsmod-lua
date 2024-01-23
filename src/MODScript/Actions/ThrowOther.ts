import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { MODscriptStates } from "elements/MODScript States/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class ThrowOther extends GenericAction {
    prefabId: string; //our prefabs are strings?
    actorId: number;

    constructor(eventId: MODscriptEvent, args: Partial<ThrowOther>) {
        super(eventId);
        this.prefabId = args.prefabId ?? "";
        this.actorId = args.actorId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine)
            return;
        const otherBody = GameplayScene.instance.getBodyById(this.actorId);
        if (!otherBody)
            return;
        this.parentEvent.stateMachine.startState(this.ActionId, MODscriptStates.throw, undefined, otherBody.body.getPosition());
        
    }
    
    trackActionProgress(): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine ) return;
        if(this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if (this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}