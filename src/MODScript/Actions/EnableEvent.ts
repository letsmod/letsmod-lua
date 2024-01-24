import { EventHandler } from "MODScript/EventHandler";
import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class EnableEvent extends GenericAction {
    eventIdToEnable: number;
    constructor(parentEvent: MODscriptEvent, args: Partial<EnableEvent>) {
        super(parentEvent);
        this.eventIdToEnable = args.eventIdToEnable ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        const eventHandler = GameplayScene.instance.eventHandler;
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor || !eventHandler) return;
        if(eventHandler.HasEvent(this.eventIdToEnable))
        {
            eventHandler.EnableEvent(this.eventIdToEnable);
            this.actionFinished();
        }
        else
            this.actionFailed();
    }

    monitorAction(): void {
        
    }
}