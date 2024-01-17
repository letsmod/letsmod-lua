import { IsOther } from "MODScript/Conditions";
import { CATs, ConditionDefinition, GenericCondition } from "MODScript/MODscriptDefs";

export class ConditionFactory {

    private static _instance: ConditionFactory
    public static get Instance() {
        if (!ConditionFactory._instance)
            ConditionFactory._instance = new ConditionFactory();
        return ConditionFactory._instance;
    }

    public createCondition(conditionDef: ConditionDefinition): GenericCondition | undefined {
        switch (conditionDef.conditionType) {
            case CATs.IsOther:
                return new IsOther(conditionDef.args);
            default:
                return undefined;
        }
    }
}