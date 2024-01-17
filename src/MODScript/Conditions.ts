import { GenericCondition } from "MODScript/MODscriptCore";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class IsOther implements GenericCondition {
    actorId: number;
    constructor(args:Partial<IsOther>) {
        this.actorId = args.actorId ?? -1;
    }

    checkConditionOnActor(actor: BodyHandle): boolean {
        
        const targetActor = GameplayScene.instance.getBodyById(this.actorId);
        if(targetActor)
        {
            return actor.body.id === targetActor.body.id;
        }

        return false;
    }
}