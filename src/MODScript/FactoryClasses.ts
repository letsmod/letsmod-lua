import { DisableEvent } from "./Actions/DisableEvent";
import { EnableEvent } from "./Actions/EnableEvent";
import { JumpUpAction } from "./Actions/JumpUpAction";
import { LookOther } from "./Actions/LookOther";
import { LookOutput } from "./Actions/LookOutput";
import { NavigateOther } from "./Actions/NavigateOther";
import { WaitAction } from "./Actions/WaitAction";
import { IsOther } from "./Conditions";
import { ActionDefinition, ConditionDefinition, GenericAction, GenericCondition, GenericTrigger, MODscriptEvent, TriggerDefinition } from "./MODscriptCore";
import { CompletedEventTrigger } from "./Triggers/CompletedEventTrigger";
import { HearTrigger } from "./Triggers/HearTrigger";
import { Nearby } from "./Triggers/Nearby";
import { TouchedTrigger } from "./Triggers/TouchedTrigger";

export class TriggerFactory {
    static createTrigger(parentEvent: MODscriptEvent, triggerDef: TriggerDefinition): GenericTrigger {
        switch (triggerDef.triggerType) {
            case "Nearby":
                return new Nearby(parentEvent, triggerDef.args);
            case "Hear":
                return new HearTrigger(parentEvent, triggerDef.args);
            case "Touched":
                return new TouchedTrigger(parentEvent, triggerDef.args);
            case "CompletedEvent":
                return new CompletedEventTrigger(parentEvent, triggerDef.args);
            default:
                throw new Error("Unknown trigger type");
        }
    }
}

export class ActionFactory {
    static createAction(parentEvent: MODscriptEvent, actionDef: ActionDefinition): GenericAction {
        switch (actionDef.actionType) {
            case "JumpUp":
                return new JumpUpAction(parentEvent, actionDef.args);
            case "LookOther":
                return new LookOther(parentEvent, actionDef.args);
            case "LookOutput":
                return new LookOutput(parentEvent, actionDef.args);
            case "NavigateOther":
                return new NavigateOther(parentEvent, actionDef.args);
            case "NavigateOutput":
                return new NavigateOther(parentEvent, actionDef.args);
            case "WaitAction":
                return new WaitAction(parentEvent, actionDef.args);
            case "DisableEvent":
                return new DisableEvent(parentEvent, actionDef.args);
            case "EnableEvent":
                return new EnableEvent(parentEvent, actionDef.args);
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