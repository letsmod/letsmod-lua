import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { MODscriptStates } from "elements/MODScript States/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class ThrowOutput extends GenericAction {
    prefabId: string; //our prefabs are strings?

    constructor(eventId:MODscriptEvent, args:Partial<ThrowOutput>) {
        super(eventId);
        this.prefabId = args.prefabId ?? "";

    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine ) 
            return;

        this.parentEvent.stateMachine.startState(this.ActionId, MODscriptStates.throw, undefined, triggerOutput.body.getPosition());
    }
    
    trackActionProgress(): void {
        if (!this.parentEvent || !this.parentEvent.stateMachine ) return;
        if(this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if(this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }
}