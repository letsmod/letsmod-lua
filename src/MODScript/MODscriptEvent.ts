import { BodyHandle } from "engine/BodyHandle";
import { TriggerDefinition, ActionDefinition, GenericTrigger, GenericAction, EventDefinition, ConditionDefinition, GenericCondition, CATs } from "./MODscriptDefs";
import { ActionFactory } from "./FactoryClasses/ActionsFactory";
import { TriggerFactory } from "./FactoryClasses/TriggersFactory";
import { MODscriptStateMachineLMent, MODscriptStates } from "elements/MODScript States/MODscriptStates";
import { Helpers } from "engine/Helpers";
import { GameplayScene } from "engine/GameplayScene";

export class MODscriptEvent {

    trigger: TriggerDefinition | undefined;
    action: ActionDefinition | undefined;

    private actorId: number = -1;
    private actorName: string = "";
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
    public get AllEventActions(): GenericAction[] { return this.allEventActions; }

    public get EventActor(): BodyHandle | undefined {
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
        this.actorName = this.eventDef.actorName;
        this.repeatable = this.eventDef.repeatable;
        this.enabled = this.eventDef.enabled;
    }

    setCATs(): void {
        if (this.trigger === undefined || this.action === undefined) return;
        this.extractInvolvedActors();
        this.actorId = this.EventActor ? this.EventActor.body.id : -1;
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
        if (this.allActionsAreFinished())
            this.completeEvent();
    }

    allActionsAreFinished(): boolean {
        return this.allEventActions.every(action => action.ActionIsFinished);
    }

    getInvolvedActor(actorId: number): BodyHandle | undefined {
        return this.involvedActorBodies.find(actor => actor.body.id === actorId);
    }


    private extractInvolvedActors(): void {

        this.involvedActorIDs.push(this.actorId);
        this._eventActor = Helpers.findBodyInScene(this.actorName);
        if (this._eventActor)
            this.involvedActorBodies.push(this._eventActor);

        if (!this.trigger || !this.trigger.args) return;

        const condition = this.trigger.args.condition as ConditionDefinition;
        if (condition && condition.args && "actorName" in condition.args) {
            const conditionBody = Helpers.findBodyInScene(condition.args.actorName as string);
            if (conditionBody)
                this.involvedActorBodies.push(conditionBody);
            this.involvedActorIDs.push(condition.args.actorId as number);
        } else if (condition && condition.conditionType === CATs.IsPlayer) {
            const player = GameplayScene.instance.memory.player;
            if (player) {
                this.involvedActorBodies.push(player);
                this.involvedActorIDs.push(player.body.id as number);
            }
        }

        if (this.action !== undefined && this.action.args !== undefined && this.action.args.actorName !== undefined) {
            const body = Helpers.findBodyInScene(this.action.args.actorName as string);
            if (body)
                this.involvedActorBodies.push(body);
            this.involvedActorIDs.push(this.action.args.actorId as number);
        }
    }

    checkEvent(): void {
        // if (this.eventId == 0) {
        //     console.log(this.eventDef?.enabled);
        // }
        if (!this.eventTrigger || !this.mainAction || !this.enabled || this.isFinished && !this.repeatable) return;

        const result = this.eventTrigger.checkTrigger();
        if (result.didTrigger)
            this.mainAction.startAction(result.outputActor);
        for (let eventAction of this.allEventActions) {
            eventAction.actionUpdate();
        }
    }

    completeEvent(): void {
        this.isFinished = true;
        if (!this.repeatable && this.stateMachine !== undefined)
            this.stateMachine.switchState(MODscriptStates.idle);
    }

    cancelEvent(): void {
        this.isFinished = false;
        if (this.stateMachine !== undefined)
            this.stateMachine.switchState(MODscriptStates.idle);
    }

    enableEvent(): void {
        this.enabled = true;
    }

    disableEvent(): void {
        this.enabled = false;
        if (this.stateMachine !== undefined)
            this.stateMachine.switchState(MODscriptStates.idle);
    }
}
