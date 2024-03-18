import { BodyHandle } from "engine/BodyHandle";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { GameplayScene } from "engine/GameplayScene";
import { GenericTrigger } from "MODScript/MODscriptGenericCATs";

export class CompletedEvent extends GenericTrigger {

    eventId: number;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<CompletedEvent>) {
        super(parentEvent);
        this.eventId = triggerArgs.eventId ?? 0;
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {

        const plotlet = this.parentEvent.plotlet;
        if(plotlet){
            const event = plotlet.getEvent(this.eventId);
            if (event && event.IsFinished)
                return { didTrigger: true, outputActor: undefined };
        }

        return { didTrigger: false, outputActor: undefined };
    }
}
