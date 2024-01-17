import { GenericCondition } from "MODScript/MODscriptDefs";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { MODscriptEvent } from "./MODscriptEvent";
import { EventHandler } from "./EventHandler";

export class IsOther implements GenericCondition {
    actorId: number;
    constructor(args:Partial<IsOther>) {
        this.actorId = args.actorId ?? -1;
    }

    checkConditionOnActor(actor: BodyHandle, parentEvent: MODscriptEvent): boolean {
        
        GameplayScene.instance.getBodyById(this.actorId);

        const targetActor = parentEvent.getInvolvedActor(this.actorId);
        if(targetActor)
            return actor.body.id === targetActor.body.id;
        return false;
    }
}