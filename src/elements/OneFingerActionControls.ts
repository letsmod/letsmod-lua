import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { AimGetstureHandler, ButtonHandler, CollisionInfo, DragGestureHandler, SwipeGestureHandler, TapGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { ShapeStateController } from "./ShapeStateController";
import { Helpers } from "engine/Helpers";
import { GuideBody } from "./GuideBody";
import { Vector3 } from "three";

export class OneFingerActionControls extends AvatarBase implements DragGestureHandler, TapGestureHandler, SwipeGestureHandler, AimGetstureHandler {
  maxSpeed: number; // meters per second
  acceleration: number; // meters per second per second
  deceleration: number; // meters per second per second
  dashSpeed: number;
  dashDuration: number;
  dashElevation: number;
  dashCooldown: number;
  cameraRotationDelayOnFlip: number;
  autoJumpMinDistance: number;
  jumpVelo: number;
  coyoteTime: number;
  attackCombo: {prefabName: string, cooldown: number, cancelWindow: number, bodyVelocity: Vector3, topAnimation: string, bottomAnimation: string}[];
  attackResetTime: number;
  attackInputLeeway: number;
  aimJumpCancelLength: number;
  aimJumpMaxSpeed: number;

  private dragDx = 0;
  private dragDy = 0;
  private lastOnGround = Infinity;
  private topAnim: ShapeStateController | undefined;
  private bottomAnim: ShapeStateController | undefined;
  private myGuideElement: GuideBody | undefined;
  private cameraRotationDelayTimer: number = 0;
  private dashTimer: number;
  private lastTapTime: number = Infinity;
  private attackCooldown: number = 0;
  private attackCancelWindow: number = 0;
  private attackIndex: number = -1;
  private aimDx = 0;
  private aimDy = 0;

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
    this.autoJumpMinDistance = params.autoJumpMinDistance === undefined ? 0 : params.autoJumpMinDistance;
    this.jumpVelo = params.jumpVelo === undefined ? 9 : params.jumpVelo;
    this.coyoteTime = params.coyoteTime === undefined ? 0.1 : params.coyoteTime;
    this.attackCombo = this.convertArray(params.attackCombo) || [];
    this.attackResetTime = params.attackResetTime === undefined ? 0.5 : params.attackResetTime;
    this.attackInputLeeway = params.attackInputLeeway === undefined ? 0.25 : params.attackInputLeeway;
    this.aimJumpCancelLength = params.aimJumpCancelLength === undefined ? 0.25 : params.aimJumpCancelLength;
    this.aimJumpMaxSpeed = params.aimJumpMaxSpeed === undefined ? this.maxSpeed : params.aimJumpMaxSpeed;
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
    {
      this.lastOnGround = 0;
    }

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

    if (this.lastOnGround > this.coyoteTime && this.attackCooldown <= this.attackCancelWindow) {
      this.playTopAnimation("Jump");
      this.playBottomAnimation("Jump");
    }
    else if (this.dashTimer <= 0 && this.attackCooldown <= this.attackCancelWindow)
    {
      // check distance to whatever is directly below the player's feet
      if (this.autoJumpMinDistance > 0 && GameplayScene.instance.clientInterface)
      {
        let intersection = GameplayScene.instance.clientInterface.raycast(this.body.body.getPosition(), Helpers.downVector, this.body.body.id, true);
        if (intersection.distance > this.autoJumpMinDistance)
        {
          let velocity = this.body.body.getVelocity();
          velocity.y = this.jumpVelo;
          this.body.body.setVelocity(velocity);
        }
      }
      
      if (this.attackCooldown <= 0)
      {
        // check whether player should attack
        if (this.lastTapTime >= 0 && this.lastTapTime <= this.attackInputLeeway)
        {
          this.nextAttack();
        }
        else if (this.attackCooldown <= -this.attackResetTime)
        {
          this.attackIndex = -1;
        }

      }
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
    
    this.attackCooldown -= dt;
    this.dashTimer -= dt;
    this.lastTapTime -= dt;

    if (this.dashTimer <= 0)
    {
      let wantsToWalk = this.dragDx != 0 || this.dragDy != 0;
      let wantsToAim = this.aimDx != 0 || this.aimDy != 0;

      if (this.attackCooldown <= this.attackCancelWindow)
      {
        if (wantsToAim)
        {
          this.rotateForAim(dt);
        }
        else if (wantsToWalk || (this.attackCooldown <= 0 && this.lastOnGround == 0))
        {
          this.Walk(dt);
        }
      }
    }
    else
    {
      this.body.body.setAngularVelocity(Helpers.zeroVector);
    }

    this.lastOnGround += dt;
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
      if (this.lastOnGround < this.coyoteTime) {
        this.playTopAnimation("Idle");
        this.playBottomAnimation("Idle");
      }
    }
    else {
      accel = this.acceleration * dt;
      this.handlePlayerOrientation();
      //Don :: For some reason, it gets some angular velocity while walking, I wrote this line to prevent it, thoughts?
      this.body.body.setAngularVelocity(Helpers.zeroVector);
      if (this.lastOnGround < this.coyoteTime) {
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

  rotateForAim(dt: number) {
    let dx = this.aimDx;
    let dy = this.aimDy;

    if (GameplayScene.instance.memory.mainCamera !== undefined && (dx != 0 || dy != 0))
    {
      let mainCamera = GameplayScene.instance.memory.mainCamera;
      let cameraOrientation = mainCamera.body.getRotation().clone();
      let cameraForward = Helpers.forwardVector.clone().applyQuaternion(cameraOrientation);
      let cameraTheta = Math.atan2(cameraForward.x, cameraForward.z);

      let angle = Math.atan2(dx, dy) + cameraTheta;
      let quat = Helpers.NewQuaternion().setFromAxisAngle(Helpers.upVector, angle);
      this.body.body.setRotation(quat);
    }

    this.aimDx = 0;
    this.aimDy = 0;
  }

  handlePlayerOrientation() {
    let angle = Math.atan2(-this.dragDx, -this.dragDy);
    let quat = Helpers.NewQuaternion();
    quat.setFromAxisAngle(Helpers.upVector, angle);
    this.body.body.setRotation(quat);
  }
  
  onTap(): void {
    this.lastTapTime = this.attackInputLeeway;
  }

  nextAttack()
  {
    this.lastTapTime = Infinity;
    this.attackIndex++;
    if (this.attackIndex >= this.attackCombo.length)
    {
      this.attackIndex = 0;
    }

    let attack = this.attackCombo[this.attackIndex];

    if (attack !== undefined)
    {
      this.attackCooldown = attack.cooldown;
      this.attackCancelWindow = attack.cancelWindow;
      let velocity = Helpers.zeroVector.copy(attack.bodyVelocity).applyQuaternion(this.body.body.getRotation());
      this.body.body.setVelocity(velocity);
      this.playTopAnimation(attack.topAnimation);
      this.playBottomAnimation(attack.bottomAnimation);
      let prefab = GameplayScene.instance.clonePrefab(attack.prefabName);
      if (prefab)
      {
        prefab.body.setPosition(this.body.body.getPosition());
        prefab.body.setRotation(this.body.body.getRotation());
      }
    }
  }

  onDrag(dx: number, dy: number): void {
    this.dragDx = dx;
    this.dragDy = dy;
  }

  onSwipe(dx: number, dy: number): void {
    if (this.lastOnGround < this.coyoteTime && this.dashTimer <= -this.dashCooldown)
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
    this.aimDx = dx;
    this.aimDy = dy;
  }

  onAimStart(): void {
    
  }

  onAimRelease(dx: number, dy: number): void {
    let length = Math.sqrt(dx * dx + dy * dy);

    if (length >= this.aimJumpCancelLength && this.lastOnGround < this.coyoteTime && this.dashTimer <= -this.dashCooldown && this.attackCooldown <= this.attackCancelWindow && GameplayScene.instance.memory.mainCamera !== undefined)
    {
      let mainCamera = GameplayScene.instance.memory.mainCamera;
      
      let aimVec = Helpers.NewVector3(dx * this.aimJumpMaxSpeed, this.jumpVelo, dy * this.aimJumpMaxSpeed);
      let cameraOrientation = mainCamera.body.getRotation().clone();
      let cameraForward = Helpers.forwardVector.clone().applyQuaternion(cameraOrientation);
      let cameraTheta = Math.atan2(cameraForward.x, cameraForward.z);
      let dragQuat = Helpers.NewQuaternion().setFromAxisAngle(Helpers.upVector, cameraTheta);
      aimVec.applyQuaternion(dragQuat);

      this.body.body.setVelocity(aimVec);
    }

    this.aimDx = 0;
    this.aimDy = 0;
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