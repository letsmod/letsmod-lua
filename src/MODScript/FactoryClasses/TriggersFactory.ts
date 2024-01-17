import { TriggerDefinition, GenericTrigger, CATs } from "MODScript/MODscriptDefs";
import { Nearby } from "MODScript/Triggers/Nearby";

export class TriggerFactory {
    
    public static createTrigger(parentEvent: any, triggerDef: TriggerDefinition): GenericTrigger | undefined {
        switch (triggerDef.triggerType) {
            case CATs.Nearby:
                return new Nearby(parentEvent, triggerDef.args);
            default:
                return undefined
        }
    }
}