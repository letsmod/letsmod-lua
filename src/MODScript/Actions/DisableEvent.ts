import { EventHandler } from "MODScript/EventHandler";
import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class DisableEvent extends GenericAction {
    eventIdToDisable: number;
    constructor(parentEvent: MODscriptEvent, args: Partial<DisableEvent>) {
        super(parentEvent);
        this.eventIdToDisable = args.eventIdToDisable ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        const eventHandler = GameplayScene.instance.eventHandler;
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor || !eventHandler) return;
        if(eventHandler.HasEvent(this.eventIdToDisable))
        {
            eventHandler.DisableEvent(this.eventIdToDisable);
            this.actionFinished();
        }
        else
            this.actionFailed();
    }

    monitorAction(): void {
        
    }
}