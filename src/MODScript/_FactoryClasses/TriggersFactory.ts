import { TriggerDefinition, CATs } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { GenericTrigger } from "MODScript/MODscriptGenericCATs";
import { CompletedEvent } from "MODScript/Triggers/CompletedEvent";
import { Damaged } from "MODScript/Triggers/Damaged";
import { Destroyed } from "MODScript/Triggers/Destroyed";
import { Hear } from "MODScript/Triggers/Hear";
import { Nearby } from "MODScript/Triggers/Nearby";
import { OtherDamaged } from "MODScript/Triggers/OtherDamaged";
import { OtherDestroyed } from "MODScript/Triggers/OtherDestroyed";
import { Touched } from "MODScript/Triggers/Touched";
import { GameplayScene } from "engine/GameplayScene";

export class TriggerFactory {

    public static createTrigger(parentEvent: MODscriptEvent, triggerDef: TriggerDefinition): GenericTrigger | undefined {
        switch (triggerDef.triggerType) {
            case CATs.Nearby:
                return new Nearby(parentEvent, triggerDef.args);
            case CATs.CompletedEvent:
                return new CompletedEvent(parentEvent, triggerDef.args);
            case CATs.Hear:
                return new Hear(parentEvent, triggerDef.args);
            case CATs.Touched:
                GameplayScene.instance.modscriptManager?.addEventBodyMapEntry(parentEvent, parentEvent.EventActorID);
                return new Touched(parentEvent, triggerDef.args);
            case CATs.OtherDestroyed:
                return new OtherDestroyed(parentEvent, triggerDef.args);
            case CATs.OtherDamaged:
                return new OtherDamaged(parentEvent, triggerDef.args);
            case CATs.Damaged:
                return new Damaged(parentEvent, triggerDef.args);
            case CATs.Destroyed:
                return new Destroyed(parentEvent, triggerDef.args);

            default:
                return undefined
        }
    }
}