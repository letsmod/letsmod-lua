import { JumpUpAction } from "../Actions/JumpUpAction";
import { ActionDefinition, CATs, ConditionDefinition, GenericAction, GenericCondition, GenericTrigger, TriggerDefinition } from "../MODscriptDefs";

export class ActionFactory {
    
    private static _instance: ActionFactory;
    public static get Instance(): ActionFactory {
        if (!ActionFactory._instance)
            ActionFactory._instance = new ActionFactory();
        return ActionFactory._instance;
    }

    public createAction(parentEvent: any, actionDef: ActionDefinition): GenericAction | undefined {
        switch (actionDef.actionType) {
            case CATs.JumpUp:
                return new JumpUpAction(parentEvent, actionDef.args);
            default:
                return undefined
        }
    }
}

