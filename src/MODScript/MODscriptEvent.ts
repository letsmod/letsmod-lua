import { BodyHandle } from "engine/BodyHandle";
import { TriggerDefinition, ActionDefinition, GenericTrigger, GenericAction, EventDefinition, ConditionDefinition, GenericCondition } from "./MODscriptDefs";
import { ActionFactory } from "./FactoryClasses/ActionsFactory";
import { TriggerFactory } from "./FactoryClasses/TriggersFactory";
import { MODscriptStateMachineLMent, MODscriptStates } from "elements/MODScript States/MODscriptStates";

export class MODscriptEvent {

    trigger: TriggerDefinition | undefined;
    action: ActionDefinition | undefined;

    private actorId: number = -1;
    private eventId: number = 0;
    private repeatable: boolean = false;
    private enabled: boolean = true;
    private allEventActions: GenericAction[] = [];

    //Getters
    public get EventActorID() { return this.actorId; }
    public get EventId() { return this.eventId; }
    public get Repeatable() { return this.repeatable; }
    public get IsActive() { return this.enabled && (!this.isFinished || this.isFinished && this.repeatable); }
    public get IsFinished() { return this.isFinished; }
    public get AllEventActions(): GenericAction[]  { return this.allEventActions;}

    public get EventActor(): BodyHandle | undefined {
        if (this._eventActor === undefined)
            this._eventActor = this.involvedActorBodies.find(actor => actor.body.id === this.actorId);
        return this._eventActor;
    }

    public get InvolvedActorIDs(): number[] { return this.involvedActorIDs; }
    public get InvolvedActorBodies(): BodyHandle[] { return this.involvedActorBodies; }


    public get stateMachine(): MODscriptStateMachineLMent | undefined {
        if (this._stateMachine === undefined && this.EventActor !== undefined) {
            this._stateMachine = this.EventActor.getElement(MODscriptStateMachineLMent);
            if (this._stateMachine === undefined)
                console.log("Cannot find MODscript State Machine on actor: " + this.actorId);
        }
        return this._stateMachine ?? undefined;
    }

    private eventTrigger: GenericTrigger | undefined;
    private mainAction: GenericAction | undefined;
    private involvedActorBodies: BodyHandle[] = [];
    private involvedActorIDs: number[] = [];
    private isFinished: boolean = false;
    private eventDef: EventDefinition | undefined;

    //Do not call these properties directly, use the getter instead because it may not be initialized.
    private _stateMachine: MODscriptStateMachineLMent | undefined;
    private _eventActor: BodyHandle | undefined;

    constructor(id: number, eventDef: EventDefinition) {
        this.eventId = id;
        this.eventDef = eventDef;

        if (!this.eventDef) return;

        this.trigger = this.eventDef.trigger;
        this.action = this.eventDef.action;
        this.actorId = this.eventDef.actorId;
        this.repeatable = this.eventDef.repeatable;
        this.enabled = this.eventDef.enabled;

        this.extractInvolvedActorIDs();

    }

    setCATs(): void {
        if (this.trigger === undefined || this.action === undefined) return;
        this.eventTrigger = TriggerFactory.createTrigger(this, this.trigger);
        this.mainAction = ActionFactory.createAction(this, this.action);
    }

    //Filled in GameplayScene
    addInvolvedActor(actor: BodyHandle): void {
        this.involvedActorBodies.push(actor);
    }

    removeInvolvedActor(actor: BodyHandle): void {
        const index = this.involvedActorBodies.indexOf(actor);
        if (index > -1) {
            this.involvedActorBodies.splice(index, 1);
        }
    }

    addAction(action: GenericAction): void {
        this.allEventActions.push(action);
    }

    checkActionsStatus(): void {
        if(this.allActionsAreFinished())
            this.completeEvent();
    }

    allActionsAreFinished():boolean{
        return this.allEventActions.every(action => action.ActionIsFinished);
    }

    getInvolvedActor(actorId: number): BodyHandle | undefined {
        return this.involvedActorBodies.find(actor => actor.body.id === actorId);
    }

    debugEvent(): void {
        if (this.trigger === undefined || this.action === undefined) {
            console.log("Event is undefined");
            return;
        }
        console.log("ActorId: " + this.actorId);
        console.log("Repeatable: " + this.repeatable);
        console.log("Enabled: " + this.enabled);
        console.log("TriggerType: " + this.trigger.triggerType);
        console.log("ActionType: " + this.action.actionType);
        if (this.trigger.args.condition !== undefined) {
            console.log("ConditionType: " + (this.trigger.args.condition as ConditionDefinition).conditionType);
            console.log("ConditionActorId: " + (this.trigger.args.condition as ConditionDefinition).args.actorId);
        }
        console.log("MaxDistance: " + this.trigger.args.maxDistance);
        console.log("JumpHeight: " + this.action.args.jumpHeight);
    }

    private extractInvolvedActorIDs(): void {

        this.involvedActorIDs.push(this.actorId);

        if (!this.trigger || !this.trigger.args) return;

        const condition = this.trigger.args.condition as ConditionDefinition;
        if (condition && condition.args && "actorId" in condition.args)
            this.involvedActorIDs.push(condition.args.actorId as number);

        if (this.action !== undefined && this.action.args !== undefined && this.action.args.actorId !== undefined)
            this.involvedActorIDs.push(this.action.args.actorId as number);
    }

    checkEvent(): void {

        if (!this.eventTrigger || !this.mainAction || !this.enabled || this.isFinished && !this.repeatable) return;
        const result = this.eventTrigger.checkTrigger();
        if (result.didTrigger)
            this.mainAction.performAction(result.outputActor);
    }

    completeEvent(): void {
        this.isFinished = true;
        if (!this.repeatable && this.stateMachine !== undefined)
            this.stateMachine.switchState(MODscriptStates.idle);
    }

    cancelEvent(): void {
        this.isFinished = false;
        this.enabled = false;
        if (this.stateMachine !== undefined)
            this.stateMachine.switchState(MODscriptStates.idle);
    }

    enableEvent(): void {
        this.enabled = true;
    }

    disableEvent(): void {
        this.enabled = false;
        //disable state machine and set it as idle and failed.
    }
}
