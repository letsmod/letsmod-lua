import { AndCond, HasTag, IsHologram, IsKinematic, IsOnTeam, IsOther, IsPhysical, IsPlayer, IsTrue, MaxMass, MinMass, MinSize, NotCond, OrCond, SeenOther } from "MODScript/Conditions";
import { HasElement } from "MODScript/Conditions";

import { CATs, ConditionDefinition } from "MODScript/MODscriptDefs";
import { GenericCondition } from "MODScript/MODscriptGenericCATs";

export class ConditionFactory {

    public static createCondition(conditionDef: ConditionDefinition): GenericCondition | undefined {
        switch (conditionDef.conditionType) {
            case CATs.IsOther:
                return new IsOther(conditionDef.args);
            case CATs.HasElement:
                return new HasElement(conditionDef.args);
            case CATs.HasTag:
                return new HasTag(conditionDef.args);
            case CATs.IsPlayer:
                return new IsPlayer();
            case CATs.IsPhysical:
                return new IsPhysical();
            case CATs.IsKinematic:
                return new IsKinematic();
            case CATs.IsHologram:
                return new IsHologram();
            case CATs.MaxMass:
                return new MaxMass(conditionDef.args);
            case CATs.MinMass:
                return new MinMass(conditionDef.args);
            case CATs.MaxSize:
                return new MaxMass(conditionDef.args);
            case CATs.MinSize:
                return new MinSize(conditionDef.args);
            case CATs.IsOnTeam:
                return new IsOnTeam(conditionDef.args);
            case CATs.AndCond:
                const cond1 = ConditionFactory.createCondition(conditionDef.args.condition1 as ConditionDefinition);
                const cond2 = ConditionFactory.createCondition(conditionDef.args.condition2 as ConditionDefinition);
                return new AndCond(cond1,cond2);
            case CATs.OrCond:
                const orCond1 = ConditionFactory.createCondition(conditionDef.args.condition1 as ConditionDefinition);
                const orCond2 = ConditionFactory.createCondition(conditionDef.args.condition2 as ConditionDefinition);
                return new OrCond(orCond1,orCond2);
            case CATs.NotCond:
                return new NotCond(conditionDef.args);
            case CATs.SeenOther:
                return new SeenOther(conditionDef.args);
            case CATs.IsTrue:
                return new IsTrue();
            default:
                return undefined;
        }
    }
}