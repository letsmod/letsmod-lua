import { BodyHandle } from "engine/BodyHandle";
import { TriggerDefinition, ActionDefinition, EventDefinition, ConditionDefinition, CATs } from "./MODscriptDefs";
import { ActionFactory } from "./_FactoryClasses/ActionsFactory";
import { Helpers } from "engine/Helpers";
import { GameplayScene } from "engine/GameplayScene";
import { CollisionInfo } from "engine/MessageHandlers";
import { CharacterStateNames } from "elements/Character State Machines/CharacterStates";
import { CharacterStateMachineLMent } from "elements/Character State Machines/CharacterStateMachineLMent";
import { GenericAction, GenericTrigger } from "./MODscriptGenericCATs";
import { MODscriptPlotlet } from "./MODscriptPlotlet";
import { TriggerFactory } from "./_FactoryClasses/TriggersFactory";

export class MODscriptEvent {

    trigger: TriggerDefinition | undefined;
    action: ActionDefinition | undefined;
    plotlet: MODscriptPlotlet | undefined;

    private actorId: number = -1;
    private actorName: string = "";
    private eventId: number = 0;
    private repeatable: boolean = false;
    private enabled: boolean = true;
    private allEventActions: GenericAction[] = [];

    //#region Getters
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
    public get stateMachine(): CharacterStateMachineLMent | undefined {
        if (this._stateMachine === undefined && this.EventActor !== undefined) {
            this._stateMachine = this.EventActor.getElement(CharacterStateMachineLMent);
            if (this._stateMachine === undefined)
                console.log("Cannot find MODscript State Machine on actor: " + this.actorId);
        }
        return this._stateMachine ?? undefined;
    }
    //#endregion

    private eventTrigger: GenericTrigger | undefined;
    private mainAction: GenericAction | undefined;
    private involvedActorBodies: BodyHandle[] = [];
    private involvedActorIDs: number[] = [];
    private isFinished: boolean = false;
    eventDef: EventDefinition | undefined;

    //Do not call these properties directly, use the getter instead because it may not be initialized.
    private _stateMachine: CharacterStateMachineLMent | undefined;
    private _eventActor: BodyHandle | undefined;

    constructor(eventDef: EventDefinition, plotlet:MODscriptPlotlet) {
        this.eventId = eventDef.id;
        this.eventDef = eventDef;
        this.plotlet = plotlet;

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

        if (condition)
            this.extractInvolvedActorsFromCondition(condition);

        if (this.action)
            this.extractInvolvedActorsFromAction(this.action);

        if (GameplayScene.instance?.modscriptManager) {
            this.involvedActorBodies.push(...GameplayScene.instance.modscriptManager.TaggedBodiesList);
        }

    }

    extractInvolvedActorsFromCondition(condition: ConditionDefinition): void {

        let conditionActorIds: number[] = [];
        if (condition.args && "actorName" in condition.args) {
            const conditionBody = Helpers.findBodyInScene(condition.args.actorName as string);
            conditionActorIds.push(condition.args.actorId as number);
            if (conditionBody)
                this.involvedActorBodies.push(conditionBody);
        } else if (condition.conditionType === CATs.IsPlayer) {
            const player = GameplayScene.instance.memory.player;
            if (player) {
                this.involvedActorBodies.push(player);
                conditionActorIds.push(player.body.id as number);
            }
        }

        this.involvedActorIDs.push(...conditionActorIds);

        if (condition.args && "condition" in condition.args) {
            const subCondition = condition.args.condition as ConditionDefinition;
            this.extractInvolvedActorsFromCondition(subCondition);
        }
        if (condition.args && "condition1" in condition.args) {
            const subCondition = condition.args.condition1 as ConditionDefinition;
            this.extractInvolvedActorsFromCondition(subCondition);
        }
        if (condition.args && "condition2" in condition.args) {
            const subCondition = condition.args.condition2 as ConditionDefinition;
            this.extractInvolvedActorsFromCondition(subCondition);
        }
    }

    extractInvolvedActorsFromAction(action: ActionDefinition): void {
        if (!action.args || !action.args.actorName) return;
        let body: BodyHandle | undefined;
        if ((action.args.actorName as string) === "Player")
            body = GameplayScene.instance.memory.player;
        else
            body = Helpers.findBodyInScene(action.args.actorName as string);
        if (body)
            this.involvedActorBodies.push(body);
        this.involvedActorIDs.push(action.args.actorId as number);

        //TODO: Make it recursive in case action type is simultaneuos.
    }

    checkEvent(info?: CollisionInfo): void {
        if (!this.eventTrigger) return;

        if (info && this.eventTrigger.requiresCollision)
            this.handleEventResult(this.eventTrigger.checkTrigger(info));
        else this.handleEventResult(this.eventTrigger.checkTrigger());
    }

    handleEventResult(result: { didTrigger: boolean, outputActor: BodyHandle | undefined }): void {
        if (!this.mainAction || !this.enabled || this.isFinished && !this.repeatable) return;

        if (result.didTrigger)
            this.mainAction.startAction(result.outputActor);
        for (let eventAction of this.allEventActions) {
            eventAction.actionUpdate();
        }
    }

    completeEvent(): void {
        this.isFinished = true;
        if (!this.repeatable && this.stateMachine !== undefined)
            this.stateMachine.switchState(this.stateMachine.defaultState);
    }

    cancelEvent(): void {
        this.isFinished = false;
    }

    enableEvent(): void {
        this.enabled = true;
    }

    disableEvent(): void {
        this.enabled = false;
        if (this.stateMachine !== undefined)
            this.stateMachine.switchState(CharacterStateNames.idle);
    }
}
