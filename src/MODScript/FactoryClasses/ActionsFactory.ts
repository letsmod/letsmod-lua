import { JumpUpAction } from "../Actions/JumpUpAction";
import { ActionDefinition, CATs, ConditionDefinition, GenericAction, GenericCondition, GenericTrigger, TriggerDefinition } from "../MODscriptDefs";

export class ActionFactory {
    
    public static createAction(parentEvent: any, actionDef: ActionDefinition): GenericAction | undefined {
        switch (actionDef.actionType) {
            case CATs.JumpUp:
                return new JumpUpAction(parentEvent, actionDef.args);
            default:
                return undefined
        }
    }
}

