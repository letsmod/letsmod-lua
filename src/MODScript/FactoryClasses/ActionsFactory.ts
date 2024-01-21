import { LookOther } from "MODScript/Actions/LookOther";
import { DestroyOther } from "MODScript/Actions/DestroyOther";
import { JumpUpAction } from "../Actions/JumpUpAction";
import { ActionDefinition, CATs, ConditionDefinition, GenericAction, GenericCondition, GenericTrigger, TriggerDefinition } from "../MODscriptDefs";
import { LookOutput } from "MODScript/Actions/LookOutput";
import { DisableEvent } from "MODScript/Actions/DisableEvent";
import { EnableEvent } from "MODScript/Actions/EnableEvent";
import { NavigateOther } from "MODScript/Actions/NavigateOther";
import { NavigateOutput } from "MODScript/Actions/NavigateOutput";
import { WaitAction } from "MODScript/Actions/WaitAction";
import { SayAction } from "MODScript/Actions/SayAction";
import { SimultaneousActions } from "MODScript/Actions/SimultaneousActions";
import { ThrowOther } from "MODScript/Actions/ThrowOther";
import { DestroyOutput } from "MODScript/Actions/DestroyOutput";

export class ActionFactory {
    
    public static createAction(parentEvent: any, actionDef: ActionDefinition): GenericAction | undefined {
        switch (actionDef.actionType) {
            case CATs.JumpUpAction:
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
            case CATs.Say:
                return new SayAction(parentEvent, actionDef.args);
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

