import { EventHandler } from "MODScript/EventHandler";
import { Action, GenericAction, MODscriptEvent } from "MODScript/MODscriptCore";
import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

export class DisableEvent extends Action {
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