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

  private cameraGuide:BodyHandle|undefined;

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
  override onCollision(info: CollisionInfo): void {
    super.onCollision(info);

    if (info.getDeltaVSelf().normalize().dot(Helpers.upVector) > 0.3)
      this.isOnGround = true;
  }

  override onStart(): void {
    super.onStart();
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
    let velocity = this.body.body.getVelocity();
    let planarVelocity = Helpers.NewVector3(velocity.x, 0, velocity.z);

    let targetX = -this.dragDx * this.maxSpeed;
    let targetZ = -this.dragDy * this.maxSpeed;
    let target = Helpers.NewVector3(targetX, 0, targetZ);

    let delta = target.sub(planarVelocity);

    let accel: number;

    if (this.dragDx == 0 && this.dragDy == 0) {
      accel = this.deceleration * Helpers.deltaTime;
    }
    else {
      accel = this.acceleration * Helpers.deltaTime;
    }

    let deltaLengthSq = delta.lengthSq();

    if (deltaLengthSq > accel * accel) {
      delta = delta.normalize().multiplyScalar(accel);
    }

    let newVelocity = velocity.add(delta);
    this.body.body.setVelocity(newVelocity);
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