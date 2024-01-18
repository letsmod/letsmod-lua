import { LookOther } from "MODScript/Actions/LookOther";
import { JumpUpAction } from "../Actions/JumpUpAction";
import { ActionDefinition, CATs, ConditionDefinition, GenericAction, GenericCondition, GenericTrigger, TriggerDefinition } from "../MODscriptDefs";
import { LookOutput } from "MODScript/Actions/LookOutput";
import { DisableEvent } from "MODScript/Actions/DisableEvent";
import { EnableEvent } from "MODScript/Actions/EnableEvent";
import { NavigateOther } from "MODScript/Actions/NavigateOther";
import { NavigateOutput } from "MODScript/Actions/NavigateOutput";
import { WaitAction } from "MODScript/Actions/WaitAction";
import { DummyJumpUpAction } from "MODScript/Actions/DummyJumpUp";

export class ActionFactory {
    
    public static createAction(parentEvent: any, actionDef: ActionDefinition): GenericAction | undefined {
        switch (actionDef.actionType) {
            case CATs.JumpUp:
                return new JumpUpAction(parentEvent, actionDef.args);
            case CATs.LookOther:
                return new LookOther(parentEvent, actionDef.args);
            case CATs.LookOutput:
                return new LookOutput(parentEvent, actionDef.args);
            case CATs.DisableEvent:
                return new DisableEvent(parentEvent, actionDef.args);
            case CATs.EnableEvent:
                return new EnableEvent(parentEvent, actionDef.args);
            case CATs.NavigateOther:
                return new NavigateOther(parentEvent, actionDef.args);
            case CATs.NavigateOutput:
                return new NavigateOutput(parentEvent, actionDef.args);
            case CATs.WaitAction:
                return new WaitAction(parentEvent, actionDef.args);
            case CATs.DummyJump:
                return new DummyJumpUpAction(parentEvent, actionDef.args);
            default:
                return undefined
        }
    }
}

