import { BodyHandle } from "engine/BodyHandle";
import { GameplayMemory } from "engine/GameplayMemory";
import { GameplayScene } from "engine/GameplayScene";
import { ButtonHandler, CollisionInfo, DragGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { ShapeStateController } from "./ShapeStateController";
import { Constants, Helpers } from "engine/Helpers";
import { Vector3 } from "three";
import { SfxPlayer } from "./SfxPlayer";

export class PlatformerControls extends AvatarBase implements ButtonHandler {
  maxSpeed: number; // meters per second
  acceleration: number; // meters per second per second
  deceleration: number; // meters per second per second
  jumpVelo: number;

  private topAnim: ShapeStateController | undefined;
  private bottomAnim: ShapeStateController | undefined;
  private lastGroundedTime: number = 0;

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
    this.body.body.lockRotation(true, false, true);
  }


  override onCollision(info: CollisionInfo): void {
    super.onCollision(info);

    if (info.getDeltaVSelf().normalize().dot(Helpers.upVector) > 0.7) {
      if (!this.isOnGround) {

        if (info.getDeltaVRelative().length() > 5) {
          this.PlayLandingSound();
        }
      }

      this.isOnGround = true;
      this.lastGroundedTime = GameplayScene.instance.memory.timeSinceStart;
    }

    this.body.body.setAngularVelocity(Helpers.zeroVector);
  }

  PlayLandingSound(){
    const sound = this.body.getElementByName("LandAudio") as SfxPlayer;
        if (sound) {
          sound.playAudio();
        }
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


  decelDelayFunc: any | undefined;
  override onUpdate(dt: number): void {
    super.onUpdate();

    this.onGroundReset();

    if (!this.isOnGround) {
      this.playTopAnimation("Jump");
      this.playBottomAnimation("Jump");
    }
    else if (this.dragDx == 0 && this.dragDy == 0) {
      this.playTopAnimation("Idle");
      this.playBottomAnimation("Idle");
    }

    /**** FIX LATER: Deceleration keeps setting the player's velocity to zero, when external velocity affects the player it still decelerates until it reaches zero. ****/
    //this.decelerate();


  }

  onGroundReset() {
    GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
      this.isOnGround = false;
    }, Helpers.deltaTime);
  }

  accelerate() {
    let accel = this.acceleration * Helpers.deltaTime;
    this.handlePlayerOrientation();
    //Don :: For some reason, it gets some angular velocity while walking, I wrote this line to prevent it, thoughts?
    this.body.body.setAngularVelocity(Helpers.zeroVector);
    if (this.isOnGround) {
      this.playTopAnimation("Walk");
      this.playBottomAnimation("Walk");
    }

    let newVelocity = this.body.body.getVelocity().clone().add(this.getVelocityDelta(accel));
    this.body.body.setVelocity(newVelocity);

  }

  decelerate() {
    if (this.dragDx != 0 || this.dragDy != 0) return;
    console.log("Meh");
    let accel = this.deceleration * Helpers.deltaTime;
    if (this.isOnGround) {
      this.playTopAnimation("Idle");
      this.playBottomAnimation("Idle");
    }

    let newVelocity = this.body.body.getVelocity().clone().add(this.getVelocityDelta(accel));
    this.body.body.setVelocity(newVelocity);

  }

  getVelocityDelta(accel: number): Vector3 {
    let velocity = this.body.body.getVelocity();
    let planarVelocity = Helpers.NewVector3(velocity.x, 0, velocity.z);

    let targetX = -this.dragDx * this.maxSpeed;
    let targetZ = -this.dragDy * this.maxSpeed;
    let target = Helpers.NewVector3(targetX, 0, targetZ);

    let delta = target.sub(planarVelocity);

    let deltaLengthSq = delta.lengthSq();

    if (deltaLengthSq > accel * accel) {
      delta = delta.normalize().multiplyScalar(accel);
    }

    return delta;
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
    if (button == Constants.AButton) {
      this.jump();
    }
  }

  onButtonHold(button: string): void {
  }

  onButtonRelease(button: string): void {
  }

  override onDrag(dx: number, dy: number): void {
    super.onDrag(dx, dy);
    this.accelerate();
  }

  hasSubtype(button: string): boolean {
    return button == Constants.AButton;
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
