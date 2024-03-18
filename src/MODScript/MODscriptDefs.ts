import { BodyHandle } from "engine/BodyHandle";
import { MODscriptEvent } from "./MODscriptEvent";

export interface eventCollisionHandler {
    handleCollision(event: MODscriptEvent, collidedActor: BodyHandle): void;
}

export declare type Vector3 = {
    x: number;
    y: number;
    z: number;
}

export declare type AudioDefinition = {
    audioActionId: string;
    audioDuration: number;
    filePath: string;
    actorThumbPath: string;
    audioGap: number;
    isPlaying: boolean;
}

export declare type ConditionDefinition = {
    conditionType: string;
    args: { [key: string]: number | Vector3 | ConditionDefinition | string };
}

export declare type TriggerDefinition = {
    triggerType: string;
    args: { [key: string]: number | ConditionDefinition };
}

export declare type ActionDefinition = {
    actionType: string;
    args: { [key: string]: number | string | ActionDefinition | Vector3 };
}

export declare type EventDefinition = {
    id: number;
    actorName: string;
    trigger: TriggerDefinition;
    action: ActionDefinition;
    repeatable: boolean;
    enabled: boolean;
}

export declare type PlotletDefinition = {
    id: number;
    type: string;
    enabled: boolean;
    args: PlotletArgs;
    outcomes: [];
}

export declare type PlotletArgs = { [key: string]: number | string | Vector3 | boolean };

export declare type PlotletOutcome = {
    outcomeType: "success" | "partialSuccess" | "failure";
    actions: [action: "enable" | "disable", plotletId: number]
}

export const plotletOutcomeTypes = {
    success: "success",
    partialSuccess: "partialSuccess",
    failure: "failure"
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
    ThrowOutput: "ThrowOutput",
    LookOther: "LookOther",
    LookOutput: "LookOutput",
    NavigateOther: "NavigateOther",
    NavigateOutput: "NavigateOutput",
    DisableEvent: "DisableEvent",
    EnableEvent: "EnableEvent",
    Say: "Say",
    Wait: "Wait",
    Instantiate: "Instantiate",

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

export const PlotletTypes = {
    talkToNPC: "talkToNpc",
}

export const Scriptlets: { [key: string]: string } = {
    [PlotletTypes.talkToNPC]: '[{"id":0,"order":0,"actorName":"<X>","actorType":"<X_type>","trigger":{"triggerType":"Nearby","args":{"maxDistance":<maxDistance>,"condition":{"conditionType":"IsPlayer","args":{}}}},"action":{"actionType":"Say","args":{"sentence":"<sentence>","audioId":"<X_type>"}},"repeatable":false,"enabled":true}]'
}