import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class NavigateOutput extends GenericAction {
    speed: number;

    constructor(eventId: MODscriptEvent, args: Partial<NavigateOutput>) {
        super(eventId);
        this.speed = args.speed ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor ) return;

        const actorPosition = triggerOutput.body.getPosition();
        const thisBody = this.parentEvent.EventActor.body;

        const thisBodyPosition = thisBody.getPosition();
        const direction = Helpers.NewVector3(0,0,0).subVectors(thisBodyPosition, actorPosition);
        const velocity = direction.multiplyScalar(this.speed);

        thisBody.setVelocity(velocity);

        if(thisBodyPosition.distanceTo(actorPosition) < 0.5)
            this.actionFinished();
    }

    actionFinishedCallback(): void {
        if(this.parentEvent.EventActor)
            this.parentEvent.EventActor.body.setVelocity(Helpers.zeroVector);
    }

    actionFailedCallback(): void {

    }
}