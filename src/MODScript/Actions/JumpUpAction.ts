import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";

import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";
import { global, js_new } from "js";

export class JumpUpAction extends GenericAction {
    jumpHeight: number;

    constructor(parentEvent:MODscriptEvent, args:Partial<JumpUpAction>) {
        super(parentEvent);
        this.jumpHeight = args.jumpHeight ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;

         this.parentEvent.EventActor.body.applyCentralForce(Helpers.NewVector3(0, this.jumpHeight, 0));
         this.actionFinished();
    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}