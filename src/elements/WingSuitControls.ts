import { BodyHandle } from "engine/BodyHandle";
import { GameplayMemory } from "engine/GameplayMemory";
import { GameplayScene } from "engine/GameplayScene";
import { ButtonHandler, CollisionInfo, DragGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { ShapeStateController } from "./ShapeStateController";
import { Helpers } from "engine/Helpers";
import { GuideBody } from "./GuideBody";

export class WingSuitControls extends AvatarBase implements ButtonHandler, DragGestureHandler {
  walkSpeed: number;
  walkAcc: number;
  walkDec: number;
  flapForce: number;
  glideSpeed: number;
  leanSpeed: number;
  maxFlaps: number;
  maxLean: number;
  glideGravity: number;
  flapFwdForceRaio: number;

  private dragDx = 0;
  private dragDy = 0;
  private isOnGround = false;
  private freeFall = false;
  private isAscending: boolean = false;
  private flapsCounter = 0;
  private anim: ShapeStateController | undefined;
  private camGuide: GuideBody | undefined;

  constructor(body: BodyHandle, id: number, params: Partial<WingSuitControls> = {}) {
    super(body, id, params);
    this.walkSpeed = params.walkSpeed === undefined ? 3 : params.walkSpeed;
    this.glideSpeed = params.glideSpeed === undefined ? 9 : params.glideSpeed;
    this.walkAcc = params.walkAcc === undefined ? this.walkSpeed * 5 : params.walkAcc;
    this.walkDec = params.walkDec === undefined ? this.walkSpeed * 5 : params.walkDec;
    this.flapForce = params.flapForce === undefined ? 12 : params.flapForce;
    this.maxFlaps = params.maxFlaps === undefined ? 6 : params.maxFlaps;
    this.glideGravity = params.glideGravity === undefined ? -2 : params.glideGravity; //-2.5
    this.leanSpeed = params.leanSpeed === undefined ? 65 : params.leanSpeed;
    this.maxLean = params.maxLean === undefined ? 60 : params.maxLean;
    this.flapFwdForceRaio = params.flapFwdForceRaio === undefined ? 0.4 : params.flapFwdForceRaio;
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

    else if (info.getDeltaVSelf().normalize().dot(Helpers.forwardVector.multiplyScalar(-1).applyQuaternion(this.body.body.getRotation())) > 0.7) {
      this.disableGlide();
    }

    this.body.body.setAngularVelocity(Helpers.zeroVector);
  }

  override onStart(): void {
    super.onStart();
    let animLmnt = this.body.getElement(ShapeStateController);
    if (animLmnt !== undefined)
      this.anim = animLmnt;
    else console.error("No " + ShapeStateController.name + " is found on this body.");

    let guideLmnt = this.body.getElement(GuideBody);
    if (guideLmnt !== undefined)
      this.camGuide = guideLmnt;
    else console.error("No " + GuideBody.name + " is found on this body.");
  }

  override onUpdate(): void {
    super.onUpdate();

    this.onGroundResetter();
    this.move();
    this.ascendingCheck();

    let leanRatio = Helpers.Deg(Helpers.GetPitch(this.body.body.getRotation())) / this.maxLean;
    let velocityLengthRatio = this.body.body.getVelocity().length() / this.glideSpeed;
    if (this.camGuide !== undefined)
      this.camGuide.updateOffsetVector(0, 3 * leanRatio, -velocityLengthRatio);

    this.dragDy = 0;
    this.dragDx = 0;
  }

  move() {
    if (this.isOnGround)
      this.walk();
    else if (!this.freeFall)
      this.glide();
  }

  glide() {
    if (this.isAscending) return;
    this.leanControl();

    let leanRatio = Helpers.Deg(Helpers.GetPitch(this.body.body.getRotation())) / this.maxLean;
    let fallVelo = Helpers.upVector.multiplyScalar(this.glideGravity);
    let newVelo = Helpers.forwardVector.applyQuaternion(this.body.body.getRotation()).multiplyScalar(this.glideSpeed + this.glideSpeed * leanRatio).add(fallVelo);
    this.body.body.setVelocity(newVelo);
  }

  walk() {
    let velocity = this.body.body.getVelocity();
    let planarVelocity = Helpers.NewVector3(velocity.x, 0, velocity.z);

    let targetZ = -this.dragDy * this.walkSpeed;
    let target = Helpers.NewVector3(0, 0, targetZ).applyQuaternion(this.body.body.getRotation());

    let delta = target.sub(planarVelocity);

    let accel: number;

    if (this.dragDy == 0) {
      accel = this.walkDec * Helpers.deltaTime;
      if (this.isOnGround)
        this.playAnimation("Idle");
    }
    else {
      accel = this.walkAcc * Helpers.deltaTime;
      if (this.isOnGround)
        this.playAnimation("Walk");

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

  leanControl() {
    let currentRot = this.body.body.getRotation().clone();
    let pitch = Helpers.GetPitch(currentRot);
    if (this.dragDy == 0) return;

    let angle = this.leanSpeed * -this.dragDy * Helpers.deltaTime;
    if (Helpers.Deg(pitch) + angle > this.maxLean)
      angle = 0;
    else if (Helpers.Deg(pitch) + angle <= 0)
      angle = 0;
    let leanOffset = Helpers.NewQuaternion().setFromAxisAngle(Helpers.rightVector.applyQuaternion(this.body.body.getRotation()), Helpers.Rad(angle));
    let newQuat = (leanOffset.multiply(this.body.body.getRotation().clone()));
    this.body.body.setRotation(newQuat);
  }

  resetLean() {
    let leanOffset = Helpers.NewQuaternion().setFromAxisAngle(Helpers.rightVector.applyQuaternion(this.body.body.getRotation()), -Helpers.GetPitch(this.body.body.getRotation()));
    let newQuat = (leanOffset.multiply(this.body.body.getRotation().clone()));
    this.body.body.setRotation(newQuat);
  }

  turnControl() {

  }

  flap() {
    if (this.flapsCounter >= this.maxFlaps)
      return;
    this.disableGlide();
    let directionVector = Helpers.forwardVector.multiplyScalar(this.flapFwdForceRaio).applyQuaternion(this.body.body.getRotation());
    directionVector.add(Helpers.upVector);
    this.body.body.setVelocity(directionVector.multiplyScalar(this.flapForce));
    this.flapsCounter++;
    this.isAscending = true;
    this.playAnimation("Fly");
  }

  hasSubtype(button: string): boolean {
    return button == "AButton" || button == "BButton";
  }

  enableGlide() {

    this.body.body.setVelocity(Helpers.zeroVector);
    this.body.body.setCustomGravity(Helpers.upVector.multiplyScalar(0));//;
    this.playAnimation("FlyIdle");
    this.freeFall = false;

  }

  disableGlide() {
    this.body.body.setCustomGravity(Helpers.upVector.multiplyScalar(-9.81 * 2.5));
    if (!this.isOnGround)
      this.playAnimation("Dive");
    this.freeFall = true;
    this.resetLean();
  }

  ascendingCheck() {
    if (!this.isAscending) return;
    if (this.body.body.getVelocity().y <= 1) {
      this.isAscending = false;
      this.enableGlide();
    }
  }

  onGroundResetter() {
    GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
      this.isOnGround = false;
    }, Helpers.deltaTime);
  }

  playAnimation(state: string) {
    if (this.anim !== undefined)
      this.anim.playState(state);
    else console.error("No " + ShapeStateController.name + " is found on this body.");
  }

  onDrag(dx: number, dy: number): void {
    this.dragDx = dx;
    this.dragDy = dy;
  }

  onButtonPress(button: string): void {
    if (button == "AButton") {
      this.flap();
    }
  }

  onButtonHold(button: string): void {
    if (button == "BButton" && !this.isOnGround) {
      this.disableGlide();
    }
  }

  onButtonRelease(button: string): void {
    if (button == "BButton" && !this.isOnGround) {
      this.enableGlide();
    }
  }
}