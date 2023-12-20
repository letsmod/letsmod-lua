import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo, UpdateHandler } from "engine/MessageHandlers";
import { PlatformerControls } from "./PlatformerControls";
import { Helpers } from "engine/Helpers";

export class Climbable extends LMent implements CollisionHandler {
    climbSpeed: number;
    private isColliding: boolean;
    private delayedFunc: any | undefined;
    private player: any | undefined;
    private controls: any | undefined;
    constructor(body: BodyHandle, id: number, params: Partial<Climbable> = {}) {
        super(body, id, params);
        this.climbSpeed = params.climbSpeed === undefined ? 1 : params.climbSpeed;
        this.isColliding = false;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
        GameplayScene.instance.dispatcher.addListener("drag", this);
    }

    onStart(): void {
        this.updatePlayer();
    }

    updatePlayer() {
        if (GameplayScene.instance.memory.player !== undefined)
            this.player = GameplayScene.instance.memory.player;
        if (this.player.getElement(PlatformerControls) !== undefined)
            this.controls = this.player.getElement(PlatformerControls);
    }

    onCollision(info: CollisionInfo) {
        this.updatePlayer();
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other === this.player && this.player !== undefined) {
            if (this.controls !== undefined) {
                if (this.controls.enabled === true)
                    this.player.body.setVelocity(Helpers.zeroVector);
                this.controls.enabled = false;
                this.isColliding = true;
                if (this.delayedFunc !== undefined) {
                    GameplayScene.instance.dispatcher.removeQueuedFunction(this.delayedFunc);
                }
                this.delayedFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(undefined, this.noCollision.bind(this), 0.1);
            }
        }
    }

    noCollision() {
        if (this.isColliding) {
            this.controls.enabled = true;
            this.isColliding = false;
            this.player.body.setCustomGravity(Helpers.NewVector3(0, -24.525, 0));
        }
    }

    onDrag(dx: number, dy: number): void {
        if (!this.isColliding) return;
        let forceForward = Helpers.NewVector3(dx, 0, dy).normalize();
        let forward = Helpers.forwardVector.applyQuaternion(this.body.body.getRotation());
        let dot = forward.dot(forceForward);
        this.player.body.setCustomGravity(Helpers.NewVector3(0, 0, 0));
        let accel;
        if (dot < 0 || dot > 0)
            accel = this.climbSpeed;
        else {
            this.noCollision();
            return;
        }
        console.log(accel, dot);
        let newVelocity = Helpers.NewVector3(0, accel, 0);
        this.player.body.setVelocity(newVelocity);
        this.controls.playTopAnimation("Idle");
        this.controls.playBottomAnimation("Idle");
        this.player.body.setAngularVelocity(Helpers.zeroVector);
    }
}