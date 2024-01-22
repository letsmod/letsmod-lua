import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";

import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";

export class JumpUpAction extends GenericAction implements CollisionHandler {
    jumpHeight: number;
    private isOnGround: boolean = false;

    constructor(parentEvent: MODscriptEvent, args: Partial<JumpUpAction>) {
        super(parentEvent);
        this.jumpHeight = args.jumpHeight ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;
        this.onGroundReset();
        if (!this.isOnGround) {
            this.actionFailed();
            return;
        }
        this.parentEvent.EventActor.body.applyCentralForce(Helpers.NewVector3(0, this.jumpHeight, 0));
        this.actionFinished();
    }

    onCollision(info: CollisionInfo): void {

        if (info.getDeltaVSelf().normalize().dot(Helpers.upVector) > 0.7) {

            this.isOnGround = true;
        }
        if (!this.parentEvent.EventActor) return;
        this.parentEvent.EventActor.body.setAngularVelocity(Helpers.zeroVector);
    }

    onGroundReset(dt?: number) {
        GameplayScene.instance.dispatcher.queueDelayedFunction(undefined, () => {
            this.isOnGround = false;
        }, dt ?? 1 / 30);
    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}