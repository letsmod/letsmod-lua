import { Action, GenericAction, MODscriptEvent } from "MODScript/MODscriptCore";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class DestroyOther extends Action {
    actorId: number;

    constructor(eventId: MODscriptEvent, args: Partial<DestroyOther>) {
        super(eventId);
        this.actorId = args.actorId ?? -1;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;

        const targetActor = GameplayScene.instance.getBodyById(this.actorId);
        if (targetActor){
            targetActor.body.destroyBody();
            this.actionFinished();
        }
        else console.log('Cannot find actor with id ' + this.actorId + ' in scene');

    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}