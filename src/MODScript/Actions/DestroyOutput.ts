import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";

import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

export class DestroyOutput extends GenericAction {
    actorId: number;

    constructor(eventId: MODscriptEvent, args: Partial<DestroyOutput>) {
        super(eventId);
        this.actorId = args.actorId ?? -1;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor)
            return;

        
        if (triggerOutput){
            triggerOutput.body.destroyBody();
            this.actionFinished();
        }
        else console.log('Cannot find triggerOutput in scene');

    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}