import { LookOther } from "MODScript/Actions/LookOther";
import { DestroyOther } from "MODScript/Actions/DestroyOther";
import { ActionDefinition, CATs } from "../MODscriptDefs";
import { LookOutput } from "MODScript/Actions/LookOutput";
import { DisableEvent } from "MODScript/Actions/DisableEvent";
import { EnableEvent } from "MODScript/Actions/EnableEvent";
import { NavigateOther } from "MODScript/Actions/NavigateOther";
import { NavigateOutput } from "MODScript/Actions/NavigateOutput";
import { WaitAction } from "MODScript/Actions/WaitAction";
import { SayAction } from "MODScript/Actions/SayAction";
import { ThrowOther } from "MODScript/Actions/ThrowOther";
import { DestroyOutput } from "MODScript/Actions/DestroyOutput";
import { ThrowOutput } from "MODScript/Actions/ThrowOutput";
import { SimultaneousAction } from "MODScript/Actions/SimultaneousAction";
import { Instantiate } from "MODScript/Actions/Instantiate";
import { GenericAction } from "MODScript/MODscriptGenericCATs";

export class ActionFactory {

    public static createAction(parentEvent: any, actionDef: ActionDefinition): GenericAction | undefined {

        switch (actionDef.actionType) {
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
            case CATs.Wait:
                return new WaitAction(parentEvent, actionDef.args);
            case CATs.Say:
                return new SayAction(parentEvent, actionDef.args);
            case CATs.DestroyOther:
                return new DestroyOther(parentEvent, actionDef.args);
            case CATs.DestroyOutput:
                return new DestroyOutput(parentEvent, actionDef.args);
            case CATs.ThrowOther:
                return new ThrowOther(parentEvent, actionDef.args);
            case CATs.ThrowOutput:
                return new ThrowOutput(parentEvent, actionDef.args);
            case CATs.Instantiate:
                return new Instantiate(parentEvent, actionDef.args);
            case CATs.SimultaneousActions:
                const action1 = ActionFactory.createAction(parentEvent, actionDef.args.action1 as ActionDefinition);
                const action2 = ActionFactory.createAction(parentEvent, actionDef.args.action2 as ActionDefinition);
                return new SimultaneousAction(parentEvent, action1, action2);
            default:
                return undefined
        }
    }
}

