import { JumpUpAction } from "./Actions/JumpUpAction";
import { IsOther } from "./Conditions";
import { ActionDefinition, ConditionDefinition, GenericAction, GenericCondition, GenericTrigger, MODscriptEvent, TriggerDefinition } from "./MODscriptCore";
import { NearbyTrigger } from "./Triggers/NearbyTrigger";

export class TriggerFactory {
    static createTrigger(parentEvent: MODscriptEvent ,triggerDef: TriggerDefinition): GenericTrigger {
        switch (triggerDef.triggerType) {
            case "Nearby":
                return new NearbyTrigger(parentEvent, triggerDef.args);
            default:
                throw new Error("Unknown trigger type");
        }
    }
}

export class ActionFactory {
    static createAction(parentEvent: MODscriptEvent,actionDef: ActionDefinition): GenericAction {
        switch (actionDef.actionType) {
            case "JumpUp":
                return new JumpUpAction(parentEvent, actionDef.args);
            default:
                throw new Error("Unknown action type");
        }
    }
}

export class ConditionFactory {
    static createCondition(conditionDef: ConditionDefinition): GenericCondition {
        switch (conditionDef.conditionType) {
            case "IsOther":
                return new IsOther(conditionDef.args);
            default:
                throw new Error("Unknown action type");
        }
    }
}