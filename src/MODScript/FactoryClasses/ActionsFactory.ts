import { DestroyOther } from "MODScript/Actions/DestroyOther";
import { JumpUpAction } from "../Actions/JumpUpAction";
import { ActionDefinition, CATs, ConditionDefinition, GenericAction, GenericCondition, GenericTrigger, TriggerDefinition } from "../MODscriptDefs";
import { SimultaneousActions } from "MODScript/Actions/SimultaneousActions";
import { ThrowOther } from "MODScript/Actions/ThrowOther";
import { DestroyOutput } from "MODScript/Actions/DestroyOutput";

export class ActionFactory {
    
    public static createAction(parentEvent: any, actionDef: ActionDefinition): GenericAction | undefined {
        switch (actionDef.actionType) {
            case CATs.JumpUpAction:
                return new JumpUpAction(parentEvent, actionDef.args);
            case CATs.DestroyOther:
                return new DestroyOther(parentEvent, actionDef.args);
            case CATs.DestroyOutput:
                return new DestroyOutput(parentEvent, actionDef.args);
            case CATs.SimultaneousActions:
                return new SimultaneousActions(parentEvent, actionDef.args);
            case CATs.ThrowOther:
                return new ThrowOther(parentEvent, actionDef.args);
            //case CATs.InstantiateAction:
                //return new InstantiateAction(parentEvent, actionDef.args);
            default:
                return undefined
        }
    }
}

