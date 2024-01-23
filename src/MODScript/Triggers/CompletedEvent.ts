import { BodyHandle } from "engine/BodyHandle";
import { GenericTrigger } from "../MODscriptDefs";
import { EventHandler } from "MODScript/EventHandler";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { GameplayScene } from "engine/GameplayScene";

export class CompletedEvent extends GenericTrigger {

    eventId: number;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<CompletedEvent>) {
        super(parentEvent);
        this.eventId = triggerArgs.eventId ?? 0;
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {

        const eventHandler = GameplayScene.instance.eventHandler;
        if(eventHandler){
            const event = eventHandler.getEvent(this.eventId);
            console.log(event?.IsFinished);
            if (event && event.IsFinished)
                return { didTrigger: true, outputActor: undefined };
        }

        return { didTrigger: false, outputActor: undefined };
    }
}
