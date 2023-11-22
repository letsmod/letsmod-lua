import { BodyHandle } from "engine/BodyHandle";
import { GameplayMemory } from "engine/GameplayMemory";
import { GameplayScene } from "engine/GameplayScene";
import { ButtonHandler, CollisionInfo, DragGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { ShapeStateController } from "./ShapeStateController";
import { Helpers } from "engine/Helpers";

export class PlatformerControls extends AvatarBase implements ButtonHandler, DragGestureHandler {
  maxSpeed: number; // meters per second
  acceleration: number; // meters per second per second
  deceleration: number; // meters per second per second
  jumpVelo: number;

  private dragDx = 0;
  private dragDy = 0;
  private topAnim: ShapeStateController | undefined;
  private bottomAnim: ShapeStateController | undefined;

  constructor(body: BodyHandle, id: number, params: Partial<PlatformerControls> = {}) {
    super(body, id, params);
    this.maxSpeed = params.maxSpeed === undefined ? 5 : params.maxSpeed;
    this.acceleration = params.acceleration === undefined ? this.maxSpeed * 5 : params.acceleration;
    this.deceleration = params.deceleration === undefined ? this.maxSpeed * 5 : params.deceleration;
    this.jumpVelo = params.jumpVelo === undefined ? 9 : params.jumpVelo;
  }

  override onInit(): void {
    super.onInit();

    GameplayScene.instance.dispatcher.addListener("button", this);
    GameplayScene.instance.dispatcher.addListener("drag", this);
    this.body.body.lockRotation(true, false, true);
  }

  override onCollision(info: CollisionInfo): void {
    super.onCollision(info);

    if (info.getDeltaVSelf().normalize().dot(Helpers.upVector) > 0.7)
      this.isOnGround = true;

    this.body.body.setAngularVelocity(Helpers.zeroVector);
  }

  override onStart(): void {
    super.onStart();
    let controllerLments = this.body.getAllElements(ShapeStateController);
    let topAnimFound = false;
    let bottomAnimFound = false;

    for (let c of controllerLments)
      if (c.name === "TopBody") {
        topAnimFound = true;
        this.topAnim = c;
      } else if (c.name === "BottomBody") {
        bottomAnimFound = true;
        this.bottomAnim = c;
      }

    if (!topAnimFound)
      console.error("No ShapeStateController of the name \"TopBody\" is found on body.");
    if (!bottomAnimFound)
      console.error("No ShapeStateController of the name \"BottomBody\" is found on body.");
  }

  override onUpdate(): void {
    super.onUpdate();

    this.onGroundReset();

    if (!this.isOnGround) {
      this.playTopAnimation("Jump");
      this.playBottomAnimation("Jump");
    }
    this.Walk();
  }

  onGroundReset() {
    GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
      this.isOnGround = false;
    }, Helpers.deltaTime);
  }

  Walk() {
    let velocity = this.body.body.getVelocity();
    let planarVelocity = Helpers.NewVector3(velocity.x, 0, velocity.z);

    let targetX = -this.dragDx * this.maxSpeed;
    let targetZ = -this.dragDy * this.maxSpeed;
    let target = Helpers.NewVector3(targetX, 0, targetZ);

    let delta = target.sub(planarVelocity);

    let accel: number;

    if (this.dragDx == 0 && this.dragDy == 0) {
      accel = this.deceleration * Helpers.deltaTime;
      if (this.isOnGround) {
        this.playTopAnimation("Idle");
        this.playBottomAnimation("Idle");
      }
    }
    else {
      accel = this.acceleration * Helpers.deltaTime;
      this.handlePlayerOrientation();
      //Don :: For some reason, it gets some angular velocity while walking, I wrote this line to prevent it, thoughts?
      this.body.body.setAngularVelocity(Helpers.zeroVector);
      if (this.isOnGround) {
        this.playTopAnimation("Walk");
        this.playBottomAnimation("Walk");
      }
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

  jump() {
    if (!this.isOnGround)
      return;
    let velocity = this.body.body.getVelocity();
    velocity.y += this.jumpVelo;
    this.body.body.setVelocity(velocity);
  }

  onButtonPress(button: string): void {
    if (button == "AButton") {
      this.jump();
    }
  }

  onButtonHold(button: string): void {
  }

  onButtonRelease(button: string): void {
  }

  onDrag(dx: number, dy: number): void {
    this.dragDx = dx;
    this.dragDy = dy;
  }

  hasSubtype(button: string): boolean {
    return button == "AButton" || button == "BButton";
  }

  playTopAnimation(state: string) {
    if (this.topAnim !== undefined)
      this.topAnim.playState(state);
    else console.error("No TopBody ShapeStateAnimator is found on this body.");
  }

  playBottomAnimation(state: string) {
    if (this.bottomAnim !== undefined)
      this.bottomAnim.playState(state);
    else console.error("No BottomBody ShapeStateAnimator is found on this body.");
  }
}
