import { EventHandler } from "MODScript/EventHandler";
import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";

export class DisableEvent extends GenericAction {
    eventId: number;
    constructor(eventId:MODscriptEvent, args:Partial<DisableEvent>) {
        super(eventId);
        this.eventId = args.eventId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;
        const event = EventHandler.instance.getEvent(this.eventId);
        if(!event) return;
        event.enabled = false;
        
        this.actionFinished();
    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}