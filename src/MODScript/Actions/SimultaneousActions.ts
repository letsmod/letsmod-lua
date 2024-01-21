import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";

import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

export class SimultaneousActions extends GenericAction {
    action1: GenericAction | undefined;
    action2: GenericAction | undefined;

    constructor(eventId: MODscriptEvent, args: Partial<SimultaneousActions>) {
        super(eventId);
        this.action1 = args.action1;
        this.action2 = args.action2;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;

        const actor = this.parentEvent.EventActor;

        // Example of determining action types and execution logic
        //(this.action1 as GenericAction).actionType == "Say";
        
        if ((this.action1 as GenericAction).actionType == "SpeakingAction" && (this.action2 as GenericAction).actionType == "NonSpeakingAction") {
            // Queue speaking action and execute non-speaking action
            //actor.queueAction(this.action1);
            //actor.executeAction(this.action2);
        } else if ((this.action1 as GenericAction).actionType == "NonSpeakingAction" && (this.action2 as GenericAction).actionType == "NonSpeakingAction") {
            // Interrupt first action with second
            //actor.interruptAction(this.action1, this.action2);
        } else {
            // Default behavior, execute both actions
            //actor.executeAction(this.action1);
            //actor.executeAction(this.action2);
        }
    
        
        this.actionFinished();
    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}