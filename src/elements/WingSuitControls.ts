import { BodyHandle } from "engine/BodyHandle";
import { GameplayMemory } from "engine/GameplayMemory";
import { GameplayScene } from "engine/GameplayScene";
import { ButtonHandler, CollisionInfo, DragGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { ShapeStateController } from "./ShapeStateController";
import { Helpers } from "engine/Helpers";

export class WingSuitControls extends AvatarBase implements ButtonHandler, DragGestureHandler {
  walkSpeed: number; // walk speed
  walkAcc: number; // walk acceleration
  walkDec: number; // walk deceleration
  flapForce: number;
  maxFlaps: number;
  glideGravity: number;

  private dragDx = 0;
  private dragDy = 0;
  private isOnGround = false;
  private canFlap = true;
  private isAscending: boolean = false;
  private flapsCounter = 0;
  private anim: ShapeStateController | undefined;
  constructor(body: BodyHandle, id: number, params: Partial<WingSuitControls> = {}) {
    super(body, id, params);
    this.walkSpeed = params.walkSpeed === undefined ? 5 : params.walkSpeed;
    this.walkAcc = params.walkAcc === undefined ? this.walkSpeed * 5 : params.walkAcc;
    this.walkDec = params.walkDec === undefined ? this.walkSpeed * 5 : params.walkDec;
    this.flapForce = params.flapForce === undefined ? 150 : params.flapForce;
    this.maxFlaps = params.maxFlaps === undefined ? 6 : params.maxFlaps;
    this.glideGravity = params.glideGravity === undefined ? -2.5 : params.glideGravity;
  }

  override onInit(): void {
    super.onInit();

    GameplayScene.instance.dispatcher.addListener("button", this);
    GameplayScene.instance.dispatcher.addListener("drag", this);
    this.body.body.lockRotation(true, false, true);
  }

  override onCollision(info: CollisionInfo): void {
    super.onCollision(info);

    if (info.getDeltaVSelf().normalize().dot(Helpers.upVector) > 0.7) {
      this.isOnGround = true;
      this.flapsCounter = 0;
      this.disableGlide();
    }
    this.body.body.setAngularVelocity(Helpers.zeroVector);
  }

  override onStart(): void {
    super.onStart();
    let x = this.body.getElement(ShapeStateController);
    if (x !== undefined)
      this.anim = x;
    else console.error("No " + ShapeStateController.name + " is found on this body.");
  }

  override onUpdate(): void {
    super.onUpdate();

    this.onGroundReset();
    this.glideCheck();
    // if (!this.isOnGround)
    //   this.playAnimation("Jump");

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

    let targetZ = -this.dragDy * this.walkSpeed;
    let target = Helpers.NewVector3(0, 0, targetZ).applyQuaternion(this.body.body.getRotation());

    let delta = target.sub(planarVelocity);

    let accel: number;

    if (this.dragDy == 0) {
      accel = this.walkDec * Helpers.deltaTime;
      //   if (this.isOnGround)
      //     this.playAnimation("Idle");
    }
    else {
      accel = this.walkAcc * Helpers.deltaTime;
      //   if (this.isOnGround)
      //     this.playAnimation("Walk");

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

  flap() {
    if (this.flapsCounter >= this.maxFlaps)
      return;
    this.body.body.applyCentralForce(Helpers.upVector.multiplyScalar(this.flapForce));
    this.flapsCounter++;
    this.disableGlide();
    this.isAscending = true;
  }

  glideCheck() {
    if (!this.isAscending) return;
    console.log(this.body.body.getVelocity().y);
    if (this.body.body.getVelocity().y < 0) {
      this.isAscending = false;
      this.enableGlide();
    }
  }

  onButtonPress(button: string): void {
    if (button == "AButton") {
      this.flap();
    }
  }

  onButtonHold(button: string): void {
  }

  onButtonRelease(button: string): void {
    if (button == "AButton")
      {
        this.isAscending = false;
        this.disableGlide();
      }
  }

  onDrag(dx: number, dy: number): void {
    this.dragDx = dx;
    this.dragDy = dy;
  }

  hasSubtype(button: string): boolean {
    return button == "AButton";
  }

  playAnimation(state: string) {
    if (this.anim !== undefined)
      this.anim.playState(state);
    else console.error("No " + ShapeStateController.name + " is found on this body.");
  }

  enableGlide() {
    console.log("Gliding");
    this.body.body.setCustomGravity(Helpers.upVector.multiplyScalar(this.glideGravity));
  }

  disableGlide() {
    this.body.body.setCustomGravity(Helpers.upVector.multiplyScalar(-9.81*2.5));
  }
}