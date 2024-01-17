import { Action, GenericAction, MODscriptEvent } from "MODScript/MODscriptCore";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class DestroyOutput extends Action {
    actorId: number;

    constructor(eventId: MODscriptEvent, args: Partial<DestroyOutput>) {
        super(eventId);
        this.actorId = args.actorId ?? -1;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;

        const targetActor = triggerOutput;
        if (targetActor)
            targetActor.body.destroyBody();
        else console.log('Cannot find triggerOutput in scene');

        this.actionFinished();
    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}