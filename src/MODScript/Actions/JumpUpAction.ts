import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { JumpUp } from "elements/JumpUp";

import { BodyHandle } from "engine/BodyHandle";

export class JumpUpAction extends GenericAction {
    jumpHeight: number;

    constructor(parentEvent: MODscriptEvent, args: Partial<JumpUpAction>) {
        super(parentEvent);
        this.jumpHeight = args.jumpHeight ?? 400;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;
        const jumpUpElement = this.parentEvent.EventActor.getElement(JumpUp);
        if (!jumpUpElement){
            console.log("JumpUpAction: No JumpUp element found");
            this.actionFailed();
            return;
        }
        jumpUpElement.jumpHeight = this.jumpHeight;
        if(jumpUpElement.jump())
            this.actionFinished();
        else this.actionFailed();
    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}