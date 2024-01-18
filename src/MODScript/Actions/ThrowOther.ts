import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";

import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

export class ThrowOther extends GenericAction {
    prefabId: number
    actorId: number;

    constructor(eventId:MODscriptEvent, args:Partial<ThrowOther>) {
        super(eventId);
        this.prefabId = args.prefabId ?? 0;
        this.actorId = args.actorId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) 
            return;

        const targetActor = this.parentEvent.getInvolvedActor(this.actorId);
        if (!targetActor) 
            return;

        const targetPos = targetActor.body.getPosition().clone();

        this.actionFinished();
    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}