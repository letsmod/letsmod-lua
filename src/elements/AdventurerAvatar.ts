import { AnimatedState, State } from "engine/StateMachineLMent";
import { AvatarBase } from "./AvatarBase";
import { BodyHandle, ShapePointer } from "engine/BodyHandle";
import { CollisionInfo } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { Helpers } from "engine/Helpers";
import { GameplayScene } from "engine/GameplayScene";

export abstract class AdventurerState extends AnimatedState
{
  stateMachine: AdventurerAvatar; // more specific type than super.stateMachine
 
  constructor(name: string, stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined, animName: string, animBlendTime: number)
  {
    super(name, stateMachine, shapeToAnimate, animName, animBlendTime);
    this.stateMachine = stateMachine;
  }
}

export abstract class StaggerableState extends AdventurerState
{
  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number): void {
    if (currentHP >= 0 && previousHP > currentHP)
    {
      this.stateMachine.switchState("stagger");
    }
  }

  onCollision(info: CollisionInfo): void {
    if (info.getDeltaVRelative().length() > this.stateMachine.forceStaggerThreshold)
    {
      this.stateMachine.switchState("stagger");
    }
  }
}

export class IdleState extends StaggerableState
{
  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("idle", stateMachine, shapeToAnimate, "idle", stateMachine.idleBlendTime);
  }

  onEnterState(previousState: State | undefined)
  {
    super.onEnterState(previousState);
  }

  onExitState(nextState: State | undefined): void {
    
  }

  onSwipe(dx: number, dy: number): void {
    this.stateMachine.switchState("dash");
  }

  onTap()
  {
    // interact with object in front of player
  }

  onUpdate(dt: number): void {
    if (this.stateMachine.lastOnGround > this.stateMachine.coyoteTime)
    {
      this.stateMachine.switchState("fall");
    }
    else if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
    {
      this.stateMachine.switchState("jog");
    }
    else
    {
      let velocity = this.stateMachine.body.body.getVelocity().clone();
      velocity.y = 0; // ignore y axis
      let deceleration = this.stateMachine.idleDeceleration;
      let body = this.stateMachine.body.body;
  
      if (velocity.length() > deceleration * dt)
      {
        body.applyCentralForce(velocity.multiplyScalar(-1 * deceleration * body.getMass()));
      }
    }
  }
}

export class JogState extends StaggerableState
{
  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("jog", stateMachine, shapeToAnimate, "jog", stateMachine.idleBlendTime);
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
  }

  onExitState(nextState: State | undefined): void {
    
  }

  onUpdate(dt: number): void {
    if (this.stateMachine.lastOnGround > this.stateMachine.coyoteTime)
    {
      this.stateMachine.switchState("fall");
    }
    else if (this.stateMachine.dragDx == 0 && this.stateMachine.dragDy == 0)
    {
      this.stateMachine.switchState("idle");
    }
    else
    {
      this.stateMachine.setFacing(-this.stateMachine.dragDx, -this.stateMachine.dragDy);
      let facing = this.stateMachine.getFacing();
      // console.log("facing", facing.x, facing.y, facing.z);
      let targetVelocity : Vector3;
      let currentPlanarVelocity = this.stateMachine.getPlanarVelocity();
      let currentPlanarSpeed = currentPlanarVelocity.length();
      // console.log("current velocity", currentPlanarVelocity.x, currentPlanarVelocity.y, currentPlanarVelocity.z);

      let isTurnaround = facing.dot(currentPlanarVelocity) < 0;
      // console.log("turnaround", isTurnaround);

      let speedLerp = Math.sqrt(this.stateMachine.dragDx * this.stateMachine.dragDx + this.stateMachine.dragDy * this.stateMachine.dragDy);
      // // console.log("speedLerp", speedLerp);
      // if (speedLerp > 0.99 && !isTurnaround)
      // {
      //   // if avatar is moving in the target direction faster than the max speed, allow them to continue moving at that speed and adjust
      //   // their velocity toward the target direction
      //   let projectedVelocity = currentPlanarVelocity.clone().projectOnVector(facing);
      //   let projectedSpeed = projectedVelocity.length();
      //   // console.log("projected speed", projectedSpeed);
      //   // console.log("facing", facing.x, facing.y, facing.z);
      //   // console.log("planar velocity", currentPlanarVelocity.x, currentPlanarVelocity.y, currentPlanarVelocity.z);
      //   // console.log("projected velocity", projectedVelocity.x, projectedVelocity.y, projectedVelocity.z);
      //   if (projectedSpeed > this.stateMachine.jogMaxSpeed)
      //   {
      //     targetVelocity = projectedVelocity;
      //   }
      //   else
      //   {
      //     targetVelocity = facing.clone().multiplyScalar(this.stateMachine.jogMaxSpeed * speedLerp);
      //   }
      // }
      // else
      {
        if (currentPlanarVelocity.dot(facing) > 0)
        {
          currentPlanarVelocity.projectOnVector(facing);
        }
        else
        {
          currentPlanarVelocity.copy(Helpers.zeroVector);
        }
        targetVelocity = facing.clone().multiplyScalar(this.stateMachine.jogMaxSpeed * speedLerp).add(currentPlanarVelocity.clone().multiplyScalar(this.stateMachine.jogAccelerationSmoothFactor));
      }

        // add multiple of facing to smooth out acceleration when speed is close to target
        // .add(facing.multiplyScalar(this.stateMachine.jogAccelerationSmoothFactor * (this.stateMachine.jogMaxSpeed + 1.0) / (currentPlanarSpeed + 1.0)));
      // let delta = facing.multiplyScalar(this.stateMachine.jogAccelerationSmoothFactor * (this.stateMachine.jogMaxSpeed + 1.0) / (currentPlanarSpeed + 1.0));
      let accelerationLerp = Math
        .max(
          Math.min(
            targetVelocity.clone().sub(currentPlanarVelocity).length() / (this.stateMachine.jogMaxSpeed * this.stateMachine.jogAccelerationSmoothFactor),
            1.0
          ),
        0.0);

      accelerationLerp = Math.pow(accelerationLerp, 2.0);

      console.log(currentPlanarSpeed, accelerationLerp, targetVelocity.length());

      let acceleration = targetVelocity.normalize().multiplyScalar(this.stateMachine.jogAccelerationMax * accelerationLerp);
     
      // console.log("acceleartion", acceleration.x, acceleration.y, acceleration.z);
      this.stateMachine.body.body.applyCentralForce(acceleration.multiplyScalar(this.stateMachine.body.body.getMass()));
    }
  }
}

/*
Idle : standing in place
Idle : loops

Stagger : reaction when hit by an attack or strong force
Stagger : does not loop
Stagger : duration: 0.5 s
Note right of Stagger : Can be entered from any state; arrows not shown for readability

Jog : jogging
Jog : loops
Jog : speed: 5 m/s

Dash : quick dash / dodge roll
Dash : does not loop
Dash : speed: 9 m/s
Dash : duration: 0.8 s

Jump : jump upwards and forward, from a jogging start
Jump : does not loop
Jump : speed: 5 m/s forward, 5 m/s up
Jump : duration: 0.5 s

Fall : falling after jumping, walking off a ledge, or being knocked back
Fall : loops

Lift : lift object from in front of player to over head, using both hands
Lift : does not loop
Lift : duration: 0.75 s
Lift : assume object is approximately 1m x 1m x 1m

Throw : throw object from over head in direction player is facing
Throw : does not loop
Throw : duration: 0.25 s
Throw : object velocity: 9 m/s forward, 3 m/s up

Place : place object in front of player
Place : does not loop
Place : duration: 0.5 s

Idle_Holding : standing in place while holding object over head
Idle_Holding : loops

Jog_Holding : jogging while holding object over head
Jog_Holding : loops
Jog_Holding : speed: 5 m/s

Jump_Holding : jump upwards and forward while holding object
Jump_Holding : does not loop
Jump_Holding : speed: 5 m/s forward, 5 m/s up
Jump_Holding : duration: 0.5 s

Fall_Holding : falling after jumping or walking off a ledge while holding object
Fall_Holding : loops

Clamber : vault up onto object in front of player at waist height
Clamber : does not loop
Clamber : duration: 0.5 s
Clamber : assume object is a flat ledge about 1m above the ground the player is standing on

Grab_Ledge: grab onto ledge in front of player, from a jumping start
Grab_Ledge: does not loop
Grab_Ledge: duration: 0.25 s
Grab_Ledge : assume object is a flat ledge which starts level with the top of the player's head

Hang: hanging from ledge
Hang: loops

Climb : climb up onto ledge, from hanging start
Climb : does not loop
Climb : duration: 1 s
*/

export class AdventurerAvatar extends AvatarBase
{
  forceStaggerThreshold : number;
  jogAccelerationMin: number;
  jogAccelerationMax: number;
  jogAccelerationSmoothFactor: number;
  jogMaxSpeed: number;
  midairMinAcceleration: number;
  midairMaxAcceleration: number;
  midairMaxSpeed: number;
  idleDeceleration: number;
  midairDeceleration: number;
  baseBlendTime : number;
  idleBlendTime : number;
  coyoteTime : number;

  lastOnGround : number = Infinity;

  constructor(body: BodyHandle, id: number, params: Partial<AdventurerAvatar> = {})
  {
    super(body, id, params);

    this.forceStaggerThreshold = params.forceStaggerThreshold ?? 2;
    this.jogAccelerationMin = params.jogAccelerationMin ?? 30;
    this.jogAccelerationMax = params.jogAccelerationMax ?? 50;
    this.jogAccelerationSmoothFactor = params.jogAccelerationSmoothFactor ?? 0.25;
    this.jogMaxSpeed = params.jogMaxSpeed ?? 5;
    this.midairMinAcceleration = params.midairMinAcceleration ?? 5;
    this.midairMaxAcceleration = params.midairMaxAcceleration ?? 15;
    this.midairMaxSpeed = params.midairMaxSpeed ?? 5;
    this.idleDeceleration = params.idleDeceleration ?? 20;
    this.midairDeceleration  = params.midairDeceleration ?? 5;
    this.baseBlendTime = params.baseBlendTime ?? 0.1;
    this.idleBlendTime = params.idleBlendTime ?? 0.25;
    this.coyoteTime = params.coyoteTime ?? 0.1;
  }

  onInit()
  {
    super.onInit();
    this.body.body.lockRotation(true, true, true);

    let shape = this.body.body.getShapes()[0];

    this.states = {
      idle: new IdleState(this, shape),
      jog: new JogState(this, shape),
    }

    this.switchState("idle");
  }

  onStart(): void {
    
  }

  onCollision(info: CollisionInfo): void {
    let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());

    if (other === undefined || !other.body.isHologram())
    {
      let direction = info.getDeltaVSelf().normalize();
      if (direction.dot(Helpers.upVector) > 0.7)
      {
        this.lastOnGround = 0;
      }
    }

    super.onCollision(info);
  }

  setFacing(dx : number, dy: number)
  {
    let cameraTheta = 0;

    if (GameplayScene.instance.memory.mainCamera !== undefined)
    {
      let mainCamera = GameplayScene.instance.memory.mainCamera;
      let cameraOrientation = mainCamera.body.getRotation().clone();
      let cameraForward = Helpers.forwardVector.clone().applyQuaternion(cameraOrientation);
      cameraTheta = Math.atan2(cameraForward.x, cameraForward.z);
    }

    let angle = Math.atan2(dx, dy) + cameraTheta;
    let quat = Helpers.NewQuaternion().setFromAxisAngle(Helpers.upVector, angle);
    this.body.body.setRotation(quat);
  }

  getFacing() : Vector3
  {
    let facing = Helpers.forwardVector.clone();
    facing.applyQuaternion(this.body.body.getRotation());
    return facing;
  }

  getPlanarVelocity() : Vector3
  {
    return this.body.body.getVelocity().clone().projectOnPlane(Helpers.upVector);
  }
}