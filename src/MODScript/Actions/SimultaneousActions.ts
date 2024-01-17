import { Action, ActionDefinition, GenericAction, MODscriptEvent } from "MODScript/MODscriptCore";
import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

export class SimultaneousActions extends Action {
    action1: GenericAction | undefined;
    action2: GenericAction | undefined;

    constructor(eventId: MODscriptEvent, args: Partial<SimultaneousActions>) {
        super(eventId);
        this.action1 = args.action1;
        this.action2 = args.action2;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;

        (this.action1 as Action).actionType == "Say";
        
        
        this.actionFinished();
    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}