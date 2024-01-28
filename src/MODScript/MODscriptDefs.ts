import { BodyHandle } from "engine/BodyHandle";
import { MODscriptEvent } from "./MODscriptEvent";
import { CollisionInfo } from "engine/MessageHandlers";

export interface eventCollisionHandler{
    handleCollision(event: MODscriptEvent, collidedActor: BodyHandle): void;
}

export abstract class GenericTrigger {
    requiresCollision: boolean = false;
    parentEvent: MODscriptEvent;
    
    constructor(parentEvent: MODscriptEvent) {
        this.parentEvent = parentEvent;
    }

    abstract checkTrigger(info?:CollisionInfo): { didTrigger: boolean; outputActor: BodyHandle | undefined; }
}

export abstract class GenericAction{

    parentEvent: MODscriptEvent;
    public actionType: string = "";
    public get ActionId() { return this._actionId; }
    public get ActionIsFinished() { return this.actionIsFinished; }
    private _actionId: string = "";
    private static actionIdCounter: number = 0;
    protected actionIsFinished: boolean = false;
    private actionStarted: boolean = false;
    
    constructor(parentEvent: MODscriptEvent, actionType: string) {
        this.parentEvent = parentEvent;
        if(parentEvent.action)
        {
            this.actionType = actionType;
            this._actionId = this.parentEvent.EventId+"_"+(++GenericAction.actionIdCounter);
            this.parentEvent.addAction(this);
        }
    }
    abstract performAction(triggerOutput?: BodyHandle | undefined): void
    abstract monitorAction():void
    
    actionUpdate(): void{
        if(this.actionStarted)
            this.monitorAction();
    }

    startAction(triggerOutput?: BodyHandle | undefined): void{
        if(this.actionStarted) return;
        this.actionStarted = true;
        this.performAction(triggerOutput);
    }

    actionFinished(): void{
        this.actionIsFinished = true;
        this.actionStarted = false;
        this.parentEvent.checkActionsStatus();
    }

    actionFailed(): void{
        this.parentEvent.cancelEvent();
        this.actionStarted = false;
    }
}

export interface GenericCondition {
    checkConditionOnActor(actor: BodyHandle, parentEvent: MODscriptEvent): boolean;
}

export declare type Vector3 = {
    x: number;
    y: number;
    z: number;
  }

export declare type ConditionDefinition = {
    conditionType: string;
    args: { [key: string]: number | Vector3 | ConditionDefinition | string};
}

export declare type TriggerDefinition = {
    triggerType: string;
    args: { [key: string]: number | ConditionDefinition };
}

export declare type ActionDefinition = {
    actionType: string;
    args: { [key: string]: number | string | ActionDefinition };
}

export declare type EventDefinition = {
    actorName: string;
    trigger: TriggerDefinition;
    action: ActionDefinition;
    repeatable: boolean;
    enabled: boolean;
}

export const CATs = {
    /*** Conditions ***/
    HasElement: "Element",
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
    IsTrue: "True",
    
    /*** Actions ***/
    JumpUpAction: "JumpUpAction",
    DestroyOther: "DestroyOther",
    DestroyOutput: "DestroyOutput",
    SimultaneousActions: "SimultaneousActions",
    ThrowOther: "ThrowOther",
    ThrowOutput: "throwOutput",
    LookOther: "LookOther",
    LookOutput: "LookOutput",
    NavigateOther: "NavigateOther",
    NavigateOutput: "NavigateOutput",
    DisableEvent: "DisableEvent",
    EnableEvent: "EnableEvent",
    Say: "Say",
    Wait: "Wait",

    /*** Triggers ***/
    Nearby: "Nearby",
    Hear: "Hear",
    Touched: "Touched",
    CompletedEvent: "CompletedEvent",
    OtherDestroyed: "OtherDestroyed",
    OtherDamaged: "OtherDamaged",
    Damaged: "Damaged",
    Destroyed: "Destroyed",
       
  };
