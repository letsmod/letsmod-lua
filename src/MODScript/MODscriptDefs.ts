import { BodyHandle } from "engine/BodyHandle";
import { MODscriptEvent } from "./MODscriptEvent";


export abstract class GenericTrigger {

    parentEvent: MODscriptEvent;
    constructor(parentEvent: MODscriptEvent) {
        this.parentEvent = parentEvent;
    }

    abstract checkTrigger(): { didTrigger: boolean; outputActor: BodyHandle | undefined; }
}

export abstract class GenericAction{

    parentEvent: MODscriptEvent;
    public actionType: string;
    constructor(parentEvent: any) {
        this.parentEvent = parentEvent;
        this.actionType = parentEvent.action.actionType;
    }
    abstract performAction(actor?: BodyHandle | undefined): void
    abstract actionFinishedCallback(): void
    abstract actionFailedCallback(): void
    
    actionFinished(): void{
        this.parentEvent.completeEvent();
        this.actionFinishedCallback();
    }

    actionFailed(): void{
        this.parentEvent.cancelEvent();
        this.actionFailedCallback();
    }
}


export interface GenericCondition {
    checkConditionOnActor(actor: BodyHandle, parentEvent: MODscriptEvent): boolean;
}

declare type Vector3 = {
    x: number;
    y: number;
    z: number;
  }

export declare type ConditionDefinition = {
    conditionType: string;
    args: { [key: string]: number | Vector3 | ConditionDefinition};
}

export declare type TriggerDefinition = {
    triggerType: string;
    args: { [key: string]: number | ConditionDefinition };
}

export declare type ActionDefinition = {
    actionType: string;
    args: { [key: string]: number | string };
}

export declare type EventDefinition = {
    actorId: number;
    trigger: TriggerDefinition;
    action: ActionDefinition;
    repeatable: boolean;
    enabled: boolean;
}

export const CATs = {
    /*** Conditions ***/
    Element: "Element",
    HasTag: "HasTag",
    IsPlayer: "IsPlayer",
    IsPhysical: "IsPhysical",
    IsKinematic: "IsKinematic",
    IsHologram: "IsHologram",
    IsOnTeam: "IsOnTeam",
    MinMass: "MinMass",
    MaxMass: "MaxMass",
    MinSize: "MinSize",
    MaxSize: "MaxSize",
    AndCond: "AndCond",
    OrCond: "OrCond",
    NotCond: "NotCond",
    IsOther: "IsOther",
    SeenOther: "SeenOther",
    IsTrue: "IsTrue",
    
    /*** Actions ***/
    JumpUpAction: "JumpUpAction",
    DestroyOther: "DestroyOther",
    DestroyOutput: "DestroyOutput",
    InstantiateAction: "InstantiateAction",
    SimultaneousActions: "SimultaneousActions",
    ThrowOther: "ThrowOther",

    /*** Triggers ***/
    Nearby: "Nearby",
    DamageTrigger: "DamageTrigger",
    DestroyedTrigger: "DestroyedTrigger",
       
  };
