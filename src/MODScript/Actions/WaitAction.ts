import { EventHandler } from "MODScript/EventHandler";
import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class WaitAction extends GenericAction {
    timeToWait: number;
    eventId: number;
    constructor(eventId: MODscriptEvent, args: Partial<WaitAction>) {
        super(eventId);
        this.timeToWait = args.timeToWait ?? 0;
        this.eventId = args.eventId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        const event = EventHandler.instance.getEvent(this.eventId);
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor || !event) return;

        GameplayScene.instance.dispatcher.queueDelayedFunction(undefined, () => { event.enabled = true }, this.timeToWait);
        this.actionFinished();
    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}