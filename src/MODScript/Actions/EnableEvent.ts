import { GenericAction } from "MODScript/MODscriptGenericCATs";
import { CATs } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";

export class EnableEvent extends GenericAction {
    eventId: number;
    constructor(parentEvent: MODscriptEvent, args: Partial<EnableEvent>) {
        super(parentEvent, CATs.EnableEvent);
        this.eventId = args.eventId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        const plotlet = this.parentEvent.plotlet;
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor || !plotlet) return;
        if(plotlet.hasEvent(this.eventId))
        {
            plotlet.enableEvent(this.eventId);
            this.actionFinished();
        }
        else
            this.actionFailed();
    }

    monitorAction(): void {
        
    }
}