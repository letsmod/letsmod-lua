import { BodyHandle } from "engine/BodyHandle";
import { ConditionDefinition, GenericCondition, MODscriptEvent, Trigger } from "../MODscriptCore";
import { ConditionFactory } from "MODScript/FactoryClasses";
import { EventHandler } from "MODScript/EventHandler";

export class CompletedEventTrigger extends Trigger {

    eventId: number;

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<CompletedEventTrigger>) {
        super(parentEvent);
        this.eventId = triggerArgs.eventId ?? 0;
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {

        const event = EventHandler.instance.getEvent(this.eventId);
            if (event && event.IsFinished)
                return { didTrigger: true, outputActor: undefined };

        return { didTrigger: false, outputActor: undefined };
    }
}
