import { BodyHandle } from "engine/BodyHandle";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { GenericTrigger } from "MODScript/MODscriptGenericCATs";

export class Destroyed extends GenericTrigger {

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<Destroyed>) {
        super(parentEvent);
    }

    checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined } {
        const actor = this.parentEvent.EventActor;
        return actor && !actor.isInScene ? { didTrigger: true, outputActor: actor } : { didTrigger: false, outputActor: undefined };
    }
}