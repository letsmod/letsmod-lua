import { EventHandler } from "MODScript/EventHandler";
import { Action, GenericAction, MODscriptEvent } from "MODScript/MODscriptCore";
import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

export class EnableEvent extends Action {
    eventId: number;
    constructor(eventId:MODscriptEvent, args:Partial<EnableEvent>) {
        super(eventId);
        this.eventId = args.eventId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;
        const event = EventHandler.instance.getEvent(this.eventId);
        if(!event) return;
        event.enabled = true;
        
        this.actionFinished();
    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}