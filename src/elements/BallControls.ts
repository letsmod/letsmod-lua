import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { ButtonHandler, CollisionInfo, DragGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { Constants, Helpers } from "engine/Helpers";
import { DragTurner } from "./DragTurner";
import { CameraTarget } from "./CameraTarget";

export class BallControls extends AvatarBase {
    maxTorque: number;
    acceleration: number;
    deceleration: number;
    turnFactor: number;

    private ballGuide: BodyHandle | undefined = undefined;
    private ballDragTurner: DragTurner | undefined = undefined;
    constructor(body: BodyHandle, id: number, params: Partial<BallControls> = {}) {
        super(body, id, params);
        this.maxTorque = params.maxTorque === undefined ? 25 : params.maxTorque;
        this.deceleration = params.deceleration === undefined ? 5 : params.deceleration;
        this.acceleration = params.acceleration === undefined ? 2.5 : params.acceleration;
        this.turnFactor = params.turnFactor === undefined ? 3 : params.turnFactor;
    }

    initBallGuide() {
        this.ballGuide = GameplayScene.instance.clonePrefab(Constants.RollerballGuide);
        if (this.ballGuide === undefined) {
            console.error("No ball guide found in prefabs.");
            return;
        }
        this.ballGuide.body.setPosition(this.body.body.getPosition());
        this.ballGuide.body.setRotation(this.body.body.getRotation());
        this.camTarget = this.ballGuide.getElement(CameraTarget);

        this.ballDragTurner = this.ballGuide.getElement(DragTurner);
        if (this.ballDragTurner === undefined) {
            console.error("Ball Guide has no 'DragTurner' element with guideName = Player.");
            return;
        }


    }

    override onCollision(info: CollisionInfo): void {
        super.onCollision(info);

        if (info.getDeltaVSelf().normalize().dot(Helpers.upVector) > 0.3)
            this.isOnGround = true;
    }

    override onStart(): void {
        super.onStart();
        this.initBallGuide();
    }

    override onUpdate(dt: number): void {
        super.onUpdate(dt);

        this.onGroundReset();
        if (dt > 0)
        {
            this.Roll(dt);
        }
    }

    onGroundReset() {
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
            this.isOnGround = false;
        }, Helpers.deltaTime);
    }

    Roll(dt: number) {

        if (this.dragDy != 0) {
            this.accelerate(dt);
        } else this.deccelerate();

        this.dragDx = 0;
        this.dragDy = 0;
    }

    deccelerate() {
        if (this.ballGuide === undefined) return;
        if (Math.abs((this.body.body.getVelocity().clone().multiply(Helpers.upVector)).length()) > 1) return;
        let angularVelo = this.body.body.getAngularVelocity();
        angularVelo.lerp(Helpers.zeroVector, this.deceleration);
        this.body.body.setAngularVelocity(angularVelo);

        this.body.body.applyTorque((Helpers.forwardVector.applyQuaternion(this.ballGuide.body.getRotation())).multiplyScalar(angularVelo.length() * this.dragDx));
    }

    accelerate(dt: number) {
        if (this.ballGuide === undefined) return;

        let dragDistance = Math.sqrt(Math.pow(this.dragDx, 2) + Math.pow(this.dragDy, 2));

        let torqueFwd = Helpers.rightVector.applyQuaternion(this.ballGuide.body.getRotation()).multiplyScalar(-this.dragDy * dragDistance * this.maxTorque);
        let torqueTurn = Helpers.forwardVector.applyQuaternion(this.ballGuide.body.getRotation()).multiplyScalar(this.dragDx * Math.abs(this.dragDy) * this.maxTorque * this.turnFactor);

        let angularVelo = this.body.body.getAngularVelocity();
        let targetVelo = (torqueFwd.add(torqueTurn))

        let accelerationFactor = this.acceleration * dt;
        angularVelo.lerp(targetVelo, accelerationFactor);

        if (angularVelo.length() > this.maxTorque) {
            angularVelo.normalize().multiplyScalar(this.maxTorque);
        }

        this.body.body.setAngularVelocity(angularVelo);
    }

    override UnequipAvatar(): void {
        if (this.ballGuide)
            GameplayScene.instance.destroyBody(this.ballGuide);
        super.UnequipAvatar();
    }
}
