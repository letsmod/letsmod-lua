import { BodyHandle } from "engine/BodyHandle";
import { TriggerDefinition, ActionDefinition, GenericTrigger, GenericAction, EventDefinition, ConditionDefinition, GenericCondition } from "./MODscriptDefs";
import { ActionFactory } from "./FactoryClasses/ActionsFactory";
import { TriggerFactory } from "./FactoryClasses/TriggersFactory";

export class MODscriptEvent {

    //Arguments
    eventId: number = 0;
    actorId: number = -1;
    trigger: TriggerDefinition | undefined;
    action: ActionDefinition | undefined;
    repeatable: boolean = false;
    enabled: boolean = true;

    public get IsActive() { return this.enabled && (!this.isFinished || this.isFinished && this.repeatable); }
    public get IsFinished() { return this.isFinished; }
    public get EventActor(): BodyHandle | undefined { return this.involvedActorBodies.find(actor => actor.body.id === this.actorId); }
    public get InvolvedActorIDs(): number[] { return this.involvedActorIDs; }
    public get InvolvedActorBodies(): BodyHandle[] { return this.involvedActorBodies; }

    private involvedActorBodies: BodyHandle[] = [];
    private involvedActorIDs: number[] = [];
    private isFinished: boolean = false;
    private eventTrigger: GenericTrigger | undefined;
    private eventAction: GenericAction | undefined;
    private eventDef: EventDefinition | undefined;

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
        this.eventTrigger = TriggerFactory.Instance.createTrigger(this, this.trigger);
        this.eventAction = ActionFactory.Instance.createAction(this, this.action);

        this.debugEvent();
    }

    addInvolvedActor(actor: BodyHandle): void {
        this.involvedActorBodies.push(actor);
    }

    removeInvolvedActor(actor: BodyHandle): void {
        const index = this.involvedActorBodies.indexOf(actor);
        if (index > -1) {
            this.involvedActorBodies.splice(index, 1);
        }
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

        if (!this.eventTrigger || !this.eventAction || !this.enabled || this.isFinished && !this.repeatable) return;

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
