import { TriggerDefinition, GenericTrigger, CATs } from "MODScript/MODscriptDefs";
import { Nearby } from "MODScript/Triggers/Nearby";

export class TriggerFactory {
    
    private static _instance: TriggerFactory
    public static get Instance() {
        if (!TriggerFactory._instance)
            TriggerFactory._instance = new TriggerFactory();
        return TriggerFactory._instance;
    }

    public createTrigger(parentEvent: any, triggerDef: TriggerDefinition): GenericTrigger | undefined {
        switch (triggerDef.triggerType) {
            case CATs.Nearby:
                return new Nearby(parentEvent, triggerDef.args);
            default:
                return undefined
        }
    }
}