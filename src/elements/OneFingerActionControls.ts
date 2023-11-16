import { BodyHandle } from "engine/BodyHandle";
import { GameplayMemory } from "engine/GameplayMemory";
import { GameplayScene } from "engine/GameplayScene";
import { AimGetstureHandler, ButtonHandler, CollisionInfo, DragGestureHandler, SwipeGestureHandler, TapGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { ShapeStateController } from "./ShapeStateController";
import { Helpers } from "engine/Helpers";
import { GuideBody } from "./GuideBody";

export class OneFingerActionControls extends AvatarBase implements DragGestureHandler, TapGestureHandler, SwipeGestureHandler, AimGetstureHandler {
  maxSpeed: number; // meters per second
  acceleration: number; // meters per second per second
  deceleration: number; // meters per second per second
  dashSpeed: number;
  dashDuration: number;
  dashElevation: number;
  dashCooldown: number;
  cameraRotationDelayOnFlip: number;

  private dragDx = 0;
  private dragDy = 0;
  private isOnGround = false;
  private topAnim: ShapeStateController | undefined;
  private bottomAnim: ShapeStateController | undefined;
  private myGuideElement: GuideBody | undefined;
  private cameraRotationDelayTimer: number = 0;
  private dashTimer: number;

  constructor(body: BodyHandle, id: number, params: Partial<OneFingerActionControls> = {}) {
    super(body, id, params);
    this.maxSpeed = params.maxSpeed === undefined ? 5 : params.maxSpeed;
    this.acceleration = params.acceleration === undefined ? this.maxSpeed * 5 : params.acceleration;
    this.deceleration = params.deceleration === undefined ? this.maxSpeed * 5 : params.deceleration;
    this.dashSpeed = params.dashSpeed === undefined ? 9 : params.dashSpeed;
    this.dashDuration = params.dashDuration === undefined ? 0.25 : params.dashDuration;
    this.dashElevation = params.dashElevation === undefined ? 0.5 : params.dashElevation;
    this.dashCooldown = params.dashCooldown === undefined ? 0.5 : params.dashCooldown;
    this.dashTimer = -this.dashCooldown;
    this.cameraRotationDelayOnFlip = params.cameraRotationDelayOnFlip === undefined ? 1 : params.cameraRotationDelayOnFlip;
  }

  override onInit(): void {
    super.onInit();
    
    GameplayScene.instance.dispatcher.addListener("drag", this);
    GameplayScene.instance.dispatcher.addListener("tap", this);
    GameplayScene.instance.dispatcher.addListener("swipe", this);
    GameplayScene.instance.dispatcher.addListener("aim", this);
    this.body.body.lockRotation(true, true, true);
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

  override onUpdate(dt: number): void {
    super.onUpdate();

    this.onGroundReset(dt);

    if (!this.isOnGround) {
      this.playTopAnimation("Jump");
      this.playBottomAnimation("Jump");
    }

    if (this.myGuideElement === undefined) {
      for (let body of GameplayScene.instance.bodies)
      {
        let guideElements = body.getAllElements(GuideBody);
        for (let guide of guideElements)
        {
          if (guide.getTargetBody() === this.body)
          {
            this.myGuideElement = guide;
            break;
          }
        }
        if (this.myGuideElement !== undefined)
        {
          break;
        }
      }
    }

    this.dashTimer -= dt;

    if (this.dashTimer <= 0)
    {
      this.Walk(dt);
    }
    else
    {
      this.body.body.setAngularVelocity(Helpers.zeroVector);
    }
  }

  onGroundReset(dt: number) {
    GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
      this.isOnGround = false;
    }, dt);
  }

  Walk(dt: number) {
    let velocity = this.body.body.getVelocity();
    let planarVelocity = Helpers.NewVector3(velocity.x, 0, velocity.z);

    let mainCamera = GameplayScene.instance.memory.mainCamera;
    let dragVec = Helpers.NewVector3(this.dragDx, 0, this.dragDy);
    let isFlipping = dragVec.dot(Helpers.forwardVector) > 0.75;

    if (this.myGuideElement !== undefined && this.myGuideElement.rotationSpeed > 0)
    {
      if (isFlipping)
      {
        this.myGuideElement.rotate = false;
        this.cameraRotationDelayTimer = 0;
      }
      else if (dragVec.lengthSq() > 0.01)
      {
        this.myGuideElement.rotate = true;
      }
      else
      {
        this.cameraRotationDelayTimer += dt;
        if (this.cameraRotationDelayTimer >= this.cameraRotationDelayOnFlip)
        {
          this.myGuideElement.rotate = true;
        }
      }
    }

    if (mainCamera !== undefined) {
      let cameraOrientation = mainCamera.body.getRotation().clone();
      let cameraForward = Helpers.forwardVector.clone().applyQuaternion(cameraOrientation);
      let cameraTheta = Math.atan2(cameraForward.x, cameraForward.z);
      let dragQuat = Helpers.NewQuaternion().setFromAxisAngle(Helpers.upVector, cameraTheta);
      dragVec.applyQuaternion(dragQuat);
      this.dragDx = dragVec.x;
      this.dragDy = dragVec.z;
    }


    let targetX = -this.dragDx * this.maxSpeed;
    let targetZ = -this.dragDy * this.maxSpeed;
    let target = Helpers.NewVector3(targetX, 0, targetZ);

    let delta = target.sub(planarVelocity);

    let accel: number;

    if (this.dragDx == 0 && this.dragDy == 0) {
      accel = this.deceleration * dt;
      if (this.isOnGround) {
        this.playTopAnimation("Idle");
        this.playBottomAnimation("Idle");
      }
    }
    else {
      accel = this.acceleration * dt;
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
  
  onTap(): void {
    console.log("tappy");
  }

  onDrag(dx: number, dy: number): void {
    this.dragDx = dx;
    this.dragDy = dy;
  }

  onSwipe(dx: number, dy: number): void {
    if (this.isOnGround && this.dashTimer <= -this.dashCooldown)
    {
      let length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      let mainCamera = GameplayScene.instance.memory.mainCamera;
      let swipeVec = Helpers.NewVector3(-dx, 0, -dy);


      if (mainCamera !== undefined) {
        let cameraOrientation = mainCamera.body.getRotation().clone();
        let cameraForward = Helpers.forwardVector.clone().applyQuaternion(cameraOrientation);
        let cameraTheta = Math.atan2(cameraForward.x, cameraForward.z);
        let dragQuat = Helpers.NewQuaternion().setFromAxisAngle(Helpers.upVector, cameraTheta);
        swipeVec.applyQuaternion(dragQuat);
      }

      // this.dragDx = -swipeVec.x;
      // this.dragDy = -swipeVec.y;

      // this.handlePlayerOrientation();

      this.dragDx = 0;
      this.dragDy = 0;
      
      swipeVec.multiplyScalar(this.dashSpeed);
      swipeVec.y = this.dashElevation;

      this.body.body.setVelocity(swipeVec);

      this.dashTimer = this.dashDuration;
    }
  }

  onAim(dx: number, dy: number): void {
    console.log("aimy");
  }

  onAimStart(): void {
    
  }

  onAimRelease(dx: number, dy: number): void {
    
  }

  playTopAnimation(state: string) {
    if (this.topAnim !== undefined)
      this.topAnim.playState(state);
    // else console.error("No TopBody ShapeStateAnimator is found on this body.");
  }

  playBottomAnimation(state: string) {
    if (this.bottomAnim !== undefined)
      this.bottomAnim.playState(state);
    // else console.error("No BottomBody ShapeStateAnimator is found on this body.");
  }
}