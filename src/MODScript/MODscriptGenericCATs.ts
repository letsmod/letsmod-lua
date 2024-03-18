import { CollisionInfo} from "engine/MessageHandlers";
import { MODscriptEvent } from "./MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";

export abstract class GenericTrigger {
    requiresCollision: boolean = false;
    parentEvent: MODscriptEvent;
    plotletId: number = 0;

    constructor(parentEvent: MODscriptEvent) {
        this.parentEvent = parentEvent;

    }

    abstract checkTrigger(info?: CollisionInfo): { didTrigger: boolean; outputActor: BodyHandle | undefined; }
}

export abstract class GenericAction {

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
        if (parentEvent.action) {
            this.actionType = actionType;
            this._actionId = this.parentEvent.EventId + "_" + (++GenericAction.actionIdCounter);
            this.parentEvent.addAction(this);
        }
    }
    abstract performAction(triggerOutput?: BodyHandle | undefined): void
    abstract monitorAction(): void

    actionUpdate(): void {
        if (this.actionStarted)
            this.monitorAction();
    }

    startAction(triggerOutput?: BodyHandle | undefined): void {
        if (this.actionStarted || this.actionIsFinished && !this.parentEvent.Repeatable) return;
        this.actionStarted = true;
        this.performAction(triggerOutput);
    }

    actionFinished(): void {
        if (this.actionIsFinished) return;
        this.actionIsFinished = true;
        this.actionStarted = false;
        this.parentEvent.checkActionsStatus();
    }

    actionFailed(): void {
        if (this.actionIsFinished) return;
        if (this.actionStarted)
            this.parentEvent.cancelEvent();
        this.actionStarted = false;
    }
}

export interface GenericCondition {
    checkConditionOnActor(actor: BodyHandle, parentEvent: MODscriptEvent): boolean;
}