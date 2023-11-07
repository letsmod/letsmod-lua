import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { ButtonHandler, CollisionInfo, DragGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { Helpers } from "engine/Helpers";

export class BallControls extends AvatarBase implements DragGestureHandler {
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    turningSpeed: number;

    private dragDx = 0;
    private dragDy = 0;
    private isOnGround = false;

    private ballGuide: BodyHandle | undefined = undefined;

    constructor(body: BodyHandle, id: number, params: Partial<BallControls> = {}) {
        super(body, id, params);
        this.maxSpeed = params.maxSpeed === undefined ? 5 : params.maxSpeed;
        this.acceleration = params.acceleration === undefined ? this.maxSpeed * 5 : params.acceleration;
        this.deceleration = params.deceleration === undefined ? this.maxSpeed * 5 : params.deceleration;
        this.turningSpeed = params.turningSpeed === undefined ? 9 : params.turningSpeed;
    }

    override onInit(): void {
        super.onInit();
        GameplayScene.instance.dispatcher.addListener("drag", this);
    }

    initBallGuide() {
        //this.ballGuide = GameplayScene.instance.bodies.find(b => {b.body.name === "CameraGuide"});

        for (let i of GameplayScene.instance.bodies)
            if (i.body.name === "CameraGuide")
                this.ballGuide = i;

        //TODO: Use the line below and delete the line above when Don applies his fix.
        //this.ballGuide = GameplayScene.instance.clonePrefab("RollerCamGuide");
        if (this.ballGuide === undefined)
            console.error("No ball guide found in prefabs.");
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

    override onUpdate(): void {
        super.onUpdate();

        this.onGroundReset();

        this.Roll();
    }

    onGroundReset() {
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
            this.isOnGround = false;
        }, Helpers.deltaTime);
    }

    Roll() {
        if (this.ballGuide === undefined) return;
        if (this.dragDy != 0) {
            let forceVal = this.acceleration * -this.dragDy;
            let moveTorque = Helpers.rightVector.applyQuaternion(this.ballGuide.body.getRotation()).multiplyScalar(forceVal);
            this.body.body.setAngularVelocity(moveTorque);
        }
        this.dragDx = 0;
        this.dragDy = 0;
    }

    handlePlayerOrientation() {
        let angle = Math.atan2(-this.dragDx, -this.dragDy);
        let quat = Helpers.NewQuaternion();
        quat.setFromAxisAngle(Helpers.upVector, angle);
        this.body.body.setRotation(quat);
    }

    onDrag(dx: number, dy: number): void {
        this.dragDx = dx;
        this.dragDy = dy;
    }

}