import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";

import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

export class DummyJumpUpAction extends GenericAction {
    jumpHeight: number;

    constructor(parentEvent:MODscriptEvent, args:Partial<DummyJumpUpAction>) {
        super(parentEvent);
        this.jumpHeight = args.jumpHeight ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;

         console.log("inside nearby event");
         //this.actionFinished();
    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}