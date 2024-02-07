import { EventHandler } from "MODScript/EventHandler";
import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class DisableEvent extends GenericAction {
    eventId: number;
    constructor(parentEvent: MODscriptEvent, args: Partial<DisableEvent>) {
        super(parentEvent, CATs.DisableEvent);
        this.eventId = args.eventId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        const eventHandler = GameplayScene.instance.eventHandler;
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor || !eventHandler) return;
        if(eventHandler.HasEvent(this.eventId))
        {
            eventHandler.DisableEvent(this.eventId);
            this.actionFinished();
        }
        else
            this.actionFailed();
    }

    monitorAction(): void {
        
    }
}