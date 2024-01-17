import { Action, GenericAction, MODscriptEvent } from "MODScript/MODscriptCore";
import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

export class JumpUpAction extends Action {
    jumpHeight: number;

    constructor(eventId:MODscriptEvent, args:Partial<JumpUpAction>) {
        super(eventId);
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