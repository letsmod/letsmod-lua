import { IsOther } from "MODScript/Conditions";
import { CATs, ConditionDefinition, GenericCondition } from "MODScript/MODscriptDefs";

export class ConditionFactory {

    public static createCondition(conditionDef: ConditionDefinition): GenericCondition | undefined {
        switch (conditionDef.conditionType) {
            case CATs.IsOther:
                return new IsOther(conditionDef.args);
            default:
                return undefined;
        }
    }
}