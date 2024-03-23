import { BodyHandle } from "engine/BodyHandle";
import { GenericCondition, GenericTrigger } from "../MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { CollisionInfo } from "engine/MessageHandlers";

export class Tapped extends GenericTrigger {

    constructor(parentEvent: MODscriptEvent, triggerArgs: Partial<Tapped>) {
        super(parentEvent);
        this.isActorTapListener = true;
    }

    checkTrigger(info: CollisionInfo, tappedActorId: number): { didTrigger: boolean, outputActor: BodyHandle | undefined } {
        const result = tappedActorId === this.parentEvent.EventActorID;
        return { didTrigger: result, outputActor: this.parentEvent.EventActor };
    }
}
