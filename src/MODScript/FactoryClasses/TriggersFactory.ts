import { TriggerDefinition, GenericTrigger, CATs } from "MODScript/MODscriptDefs";
import { CompletedEvent } from "MODScript/Triggers/CompletedEvent";
import { Hear } from "MODScript/Triggers/Hear";
import { Nearby } from "MODScript/Triggers/Nearby";
import { Touched } from "MODScript/Triggers/Touched";

export class TriggerFactory {
    
    public static createTrigger(parentEvent: any, triggerDef: TriggerDefinition): GenericTrigger | undefined {
        switch (triggerDef.triggerType) {
            case CATs.Nearby:
                return new Nearby(parentEvent, triggerDef.args);
            case CATs.CompletedEvent:
                return new CompletedEvent(parentEvent, triggerDef.args);
            case CATs.Hear:
                return new Hear(parentEvent, triggerDef.args);
            case CATs.Touched:
                return new Touched(parentEvent, triggerDef.args);
            default:
                return undefined
        }
    }
}