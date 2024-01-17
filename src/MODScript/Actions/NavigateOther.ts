import { GenericAction} from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class NavigateOther extends GenericAction {
    speed: number;
    actorId: number;

    constructor(eventId: MODscriptEvent, args: Partial<NavigateOther>) {
        super(eventId);
        this.actorId = args.actorId ?? 0;
        this.speed = args.speed ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        const actor = GameplayScene.instance.getBodyById(this.actorId);
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor || !actor) return;

        const actorPosition = actor.body.getPosition();
        const thisBody = this.parentEvent.EventActor.body;

        const thisBodyPosition = thisBody.getPosition();
        const direction = Helpers.NewVector3(0, 0, 0).subVectors(thisBodyPosition, actorPosition);
        const velocity = direction.multiplyScalar(this.speed);

        thisBody.setVelocity(velocity);

        if (thisBodyPosition.distanceTo(actorPosition) < 0.5)
            this.actionFinished();
    }

    actionFinishedCallback(): void {
        if (this.parentEvent.EventActor)
            this.parentEvent.EventActor.body.setVelocity(Helpers.zeroVector);
    }

    actionFailedCallback(): void {

    }
}