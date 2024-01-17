import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { TriggerFactory, ActionFactory } from "./FactoryClasses";

export class MODscriptEvent {
    static nextEventId: number = 0;
    
    //Arguments
    eventId: number;
    actorId: number;
    trigger: TriggerDefinition;
    action: ActionDefinition;
    repeatable: boolean;

    //To Don: Why do we pass this from the MODscript to the definition, since events run sequentially? 
    //Shouldn't this be a property of the event and not passed in?
    enabled: boolean;
    
    public get IsActive() { return this.enabled && (!this.isFinished || this.isFinished && this.repeatable) ; }
    public get IsFinished() { return this.isFinished; }
    public get EventActor(): BodyHandle | undefined { return this.eventActor; }
    public get InvolvedActors(): BodyHandle[] { return this.involvedActors; }

    private involvedActors: BodyHandle[] = [];
    private isFinished:boolean = false;
    private eventTrigger: GenericTrigger;
    private eventAction: GenericAction;
    private eventActor: BodyHandle | undefined;

    constructor(eventDef: EventDefinition) {
        this.eventId = ++MODscriptEvent.nextEventId;
        this.trigger = eventDef.trigger;
        this.action = eventDef.action;
        this.actorId = eventDef.actorId;
        this.repeatable = eventDef.repeatable;
        this.enabled = eventDef.enabled;

        this.eventTrigger = TriggerFactory.createTrigger(this,eventDef.trigger);
        this.eventAction = ActionFactory.createAction(this,eventDef.action);

        this.extractInvolvedActors();
    }

    private extractInvolvedActors(): void {
        if (this.actorId) {
            this.eventActor = GameplayScene.instance.getBodyById(this.actorId)
            if (this.eventActor)
                this.involvedActors.push(this.eventActor);
            else console.log('Cannot find actor with id ' + this.actorId + ' in scene');
        }
        if (!this.trigger.args) return;
        const condition = this.trigger.args.condition as ConditionDefinition;
        if (condition && condition.args && 'actorId' in condition.args)
            this.pushToInvolvedActors(condition.args.actorId as number);

        const action = this.action;
        if (action && action.args && 'actorId' in action.args)
            this.pushToInvolvedActors(action.args.actorId);
    }

    private pushToInvolvedActors(actorId: number): void {
        const actor = GameplayScene.instance.getBodyById(actorId);
        if (actor)
            this.involvedActors.push(actor);
        else console.log('Cannot find actor with id ' + actorId + ' in scene');
    }

    checkEvent(): void {

        if (!this.enabled || this.isFinished && !this.repeatable) return;

        const result = this.eventTrigger.checkTrigger();
        if (result.didTrigger)
            this.eventAction.performAction(result.outputActor);
    }

    completeEvent(): void {
        this.isFinished = true;
        if (!this.repeatable) 
            this.enabled = false;
    }

    cancelEvent(): void {
        this.isFinished = false;
        this.enabled = false;
    }
}

export abstract class Trigger implements GenericTrigger {

    parentEvent: MODscriptEvent;
    constructor(parentEvent: MODscriptEvent) {
        this.parentEvent = parentEvent;
    }

    abstract checkTrigger(): { didTrigger: boolean; outputActor: BodyHandle | undefined; }
}

export abstract class Action implements GenericAction {

    public actionType: string;

    parentEvent: MODscriptEvent;
    constructor(parentEvent: MODscriptEvent) {
        this.parentEvent = parentEvent;
        this.actionType = this.parentEvent.action.actionType;
    }
    abstract performAction(actor?: BodyHandle | undefined): void
    abstract actionFinishedCallback(): void
    abstract actionFailedCallback(): void
    
    actionFinished(): void{
        this.parentEvent.completeEvent();
        this.actionFinishedCallback();
    }

    //To Don: When should we call this?
    actionFailed(): void{
        this.parentEvent.cancelEvent();
        this.actionFailedCallback();
    }
}

//To Don: Do we need this interface, since we have the Trigger and Action abstract classes?
/**/ export interface GenericTrigger {                                                  /**/    
/**/     checkTrigger(): { didTrigger: boolean, outputActor: BodyHandle | undefined };  /**/
/**/ }                                                                                  /**/          
/**/                                                                                    /**/
/**/ export interface GenericAction {                                                   /**/           
/**/     performAction(triggerOutput?: BodyHandle): void;                               /**/
/**/     actionFinished(): void;                                                        /**/                                            
/**/     actionFailed(): void;                                                          /**/ 
/**/ }                                                                                  /**/ 
////////////////////////////////////////////////////////////////////////////////////////////


export interface GenericCondition {
    checkConditionOnActor(actor: BodyHandle): boolean;
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
    args: { [key: string]: number };
}

export declare type EventDefinition = {
    actorId: number;
    trigger: TriggerDefinition;
    action: ActionDefinition;
    repeatable: boolean;
    enabled: boolean;
}