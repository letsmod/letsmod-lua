import { EventHandler } from "MODScript/EventHandler";
import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class DisableEvent extends GenericAction {
    eventId: number;
    constructor(parentEvent: MODscriptEvent, args: Partial<DisableEvent>) {
        super(parentEvent);
        this.eventId = args.eventId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        const eventHandler = GameplayScene.instance.eventHandler;
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor || !eventHandler) return;
        const event = eventHandler.getEvent(this.eventId);
        if (!event) return;

        this.actionFinished();
    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}