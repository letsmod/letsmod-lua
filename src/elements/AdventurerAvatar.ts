import { AnimatedState, State } from "engine/StateMachineLMent";
import { AvatarBase } from "./AvatarBase";
import { BodyHandle, ShapePointer } from "engine/BodyHandle";
import { CollisionInfo, InteractHandler } from "engine/MessageHandlers";
import { Quaternion, Vector3 } from "three";
import { Helpers } from "engine/Helpers";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { AbstractGadget } from "./AbstractGadget";
import { GuideBody } from "./GuideBody";
import { CameraTarget } from "./CameraTarget";
import { Fragile } from "./Fragile";
import { Throwable } from "./Throwable";

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

  // onSwipe(dx: number, dy: number): void {
  //   this.stateMachine.switchState("dash");
  // }

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
  }
}

export class JogState extends StaggerableState
{
  timeInJog: number = 0;
  blocked_y_clamber: number = 2;
  blocked_y_climb: number = 2;
  blocked_y_jump: number = 2;

  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("jog", stateMachine, shapeToAnimate, "jog", stateMachine.baseBlendTime);
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    this.blocked_y_clamber = 2;
    this.blocked_y_climb = 2;
    this.blocked_y_jump = 2;
    this.timeInJog = 0;
  }

  onExitState(nextState: State | undefined): void {
    
  }

  onUpdate(dt: number): void {
    if (this.stateMachine.autoJumpMinDistance > 0 && GameplayScene.instance.clientInterface && this.timeInJog > this.stateMachine.coyoteTime)
    {
      let intersection = GameplayScene.instance.clientInterface.raycast(this.stateMachine.body.body.getPosition(), Helpers.downVector, this.stateMachine.body.body.id, true);
      if (intersection.distance > this.stateMachine.autoJumpMinDistance)
      {
        this.stateMachine.switchState("jump");
        return;
      }
    }

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
      this.stateMachine.accelerateWithParams(this.stateMachine.jogAcceleration, this.stateMachine.jogAccelerationSmoothFactor, this.stateMachine.jogMaxSpeed, dt);
    }

    this.blocked_y_clamber--;
    this.blocked_y_climb--;
    this.blocked_y_jump--;
    this.timeInJog += dt;
  }

  onCollision(info: CollisionInfo): void {
    super.onCollision(info);
    let deltaV = info.getDeltaVSelf();
    let facing = this.stateMachine.getFacing();
    if (Math.abs(deltaV.y) < 0.01 && deltaV.normalize().dot(facing) < this.stateMachine.climbDotProductThreshold)
    {
      let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
      if (other?.body.isKinematic())
      {
        if (this.blocked_y_clamber <= 0)
        {
          this.stateMachine.climbTarget = other;
          this.stateMachine.climbTargetOffset = this.stateMachine.body.body.getPosition().clone().sub(other.body.getPosition()).applyQuaternion(other.body.getRotation().clone().invert());
          this.stateMachine.switchState("clamber");
          this.stateMachine.faceContactPoint(info.getContactPointOnSelf());
          // TODO: adjust starting point of clamber animation based on height difference
        }
        else if (this.blocked_y_climb <= 0)
        {
          this.stateMachine.climbTarget = other;
          this.stateMachine.climbTargetOffset = this.stateMachine.body.body.getPosition().clone().sub(other.body.getPosition()).applyQuaternion(other.body.getRotation().clone().invert());
          this.stateMachine.switchState("climb");
          this.stateMachine.faceContactPoint(info.getContactPointOnSelf());
          // TODO: adjust starting point of climb animation based on height difference
        }
        else if (this.blocked_y_jump <= 0)
        {
          this.stateMachine.switchState("jump");
        }
      }  
    }
  }

  onTrigger(source: LMent, triggerId: string): void {
    if (triggerId == "blocked_y_clamber")
    {
      this.blocked_y_clamber = 2;
    }
    else if (triggerId == "blocked_y_climb")
    {
      this.blocked_y_climb = 2;
    }
    else if (triggerId == "blocked_y_jump")
    {
      this.blocked_y_jump= 2;
    }
  }

  hasSubtype(subtype: string): boolean {
    return subtype == "blocked_y_clamber" || subtype == "blocked_y_climb" || subtype == "blocked_y_jump";
  }
}

export class JumpState extends StaggerableState
{
  timeInJump: number;
  blocked_y_clamber: number = 2;
  blocked_y_climb: number = 2;

  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("jump", stateMachine, shapeToAnimate, "jump", stateMachine.baseBlendTime);
    this.timeInJump = 0;
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    let velocity = this.stateMachine.body.body.getVelocity();
    velocity.y += this.stateMachine.jumpInitialVelocity;
    this.stateMachine.body.body.setVelocity(velocity);
    this.stateMachine.lastOnGround = Infinity;
    this.timeInJump = 0;
    this.blocked_y_climb = 2;
  }

  onExitState(nextState: State | undefined): void {
    
  }

  onUpdate(dt: number): void {
    this.timeInJump += dt;
    if (this.stateMachine.lastOnGround == 0 && this.timeInJump >= this.stateMachine.coyoteTime)
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.switchState("jog");
      }
      else
      {
        this.stateMachine.switchState("idle");
      }
    }
    else if (this.stateMachine.body.body.getVelocity().y < this.stateMachine.jumpToFallThreshold)
    {
      this.stateMachine.switchState("fall");
    }
    else
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.accelerateWithParams(this.stateMachine.midairAcceleration, this.stateMachine.midairAccelerationSmoothFactor, this.stateMachine.midairMaxSpeed, dt);
      }
      else
      {
        let body = this.stateMachine.body.body;
        let velocity = body.getVelocity().clone();
        let origY = velocity.y;
        velocity.y = 0; // ignore y axis
        let deceleration = this.stateMachine.midairDeceleration;
    
        if (velocity.length() > deceleration * dt)
        {
          velocity.add(velocity.clone().normalize().multiplyScalar(-1 * deceleration * dt));
          velocity.y = origY;
        }
        else
        {
          velocity.set(0,origY,0);
        }
        body.setVelocity(velocity);
      }
    }
    this.blocked_y_clamber--;
    this.blocked_y_climb--;
  }

  onCollision(info: CollisionInfo): void {
    super.onCollision(info);
    let deltaV = info.getDeltaVSelf();
    let facing = this.stateMachine.getFacing();
    if (Math.abs(deltaV.y) < 0.01 && deltaV.normalize().dot(facing) < this.stateMachine.climbDotProductThreshold)
    {
      let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
      if (other?.body.isKinematic())
      {
        if (this.blocked_y_clamber <= 0 && this.stateMachine.clamberDetector !== undefined)
        {
          let pos = this.stateMachine.clamberDetector.body.getPosition().clone().add(Helpers.upVector.clone().multiplyScalar(this.stateMachine.detectorYOffset));
          let rcResult = GameplayScene.instance.clientInterface?.raycast(pos, Helpers.downVector, this.stateMachine.clamberDetector.body.id, true);
          if (rcResult?.body == other && rcResult.distance < this.stateMachine.climbDetectorMaxDistance)
          {
            this.stateMachine.climbTarget = other;
            this.stateMachine.climbTargetOffset = this.stateMachine.body.body.getPosition().clone().sub(other.body.getPosition()).applyQuaternion(other.body.getRotation().clone().invert());
            this.stateMachine.switchState("clamber");
            this.stateMachine.faceContactPoint(info.getContactPointOnSelf());
            // TODO: adjust starting point of clamber animation based on height difference
            return;
          }
        }
        if (this.blocked_y_climb <= 0 && this.stateMachine.climbDetector !== undefined)
        {
          let pos = this.stateMachine.climbDetector.body.getPosition().clone().add(Helpers.upVector.clone().multiplyScalar(this.stateMachine.detectorYOffset));
          let rcResult = GameplayScene.instance.clientInterface?.raycast(pos, Helpers.downVector, this.stateMachine.climbDetector.body.id, true);
          if (rcResult?.body == other && rcResult.distance < this.stateMachine.climbDetectorMaxDistance)
          {
            this.stateMachine.climbTarget = other;
            this.stateMachine.climbTargetOffset = this.stateMachine.body.body.getPosition().clone().sub(other.body.getPosition()).applyQuaternion(other.body.getRotation().clone().invert());
            this.stateMachine.switchState("climb");
            this.stateMachine.faceContactPoint(info.getContactPointOnSelf());
            // TODO: adjust starting point of climb animation based on height difference
            return;
          }
        }
      }  
    }
  }

  onTrigger(source: LMent, triggerId: string): void {
    if (triggerId == "blocked_y_climb")
    {
      this.blocked_y_climb = 2;
    }
    else if (triggerId == "blocked_y_clamber")
    {
      this.blocked_y_clamber = 2;
    }
  }

  hasSubtype(subtype: string): boolean {
    return subtype == "blocked_y_climb" || subtype == "blocked_y_clamber";
  }
}

export class FallState extends StaggerableState
{
  blocked_y_clamber: number = 2;
  blocked_y_climb: number = 2;
  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("fall", stateMachine, shapeToAnimate, "fall", stateMachine.baseBlendTime);
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    this.stateMachine.lastOnGround = Infinity;
    this.blocked_y_clamber = 2;
    this.blocked_y_climb = 2;
  }

  onExitState(nextState: State | undefined): void {
    
  }

  onUpdate(dt: number): void {
    if (this.stateMachine.lastOnGround == 0)
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.switchState("jog");
      }
      else
      {
        this.stateMachine.switchState("idle");
      }
    }
    else
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.accelerateWithParams(this.stateMachine.midairAcceleration, this.stateMachine.midairAccelerationSmoothFactor, this.stateMachine.midairMaxSpeed, dt);
      }
      else
      {
        let body = this.stateMachine.body.body;
        let velocity = body.getVelocity().clone();
        let origY = velocity.y;
        velocity.y = 0; // ignore y axis
        let deceleration = this.stateMachine.midairDeceleration;
    
        if (velocity.length() > deceleration * dt)
        {
          velocity.add(velocity.clone().normalize().multiplyScalar(-1 * deceleration * dt));
          velocity.y = origY;
        }
        else
        {
          velocity.set(0,origY,0);
        }
        body.setVelocity(velocity);
      }
    }
    this.blocked_y_clamber--;
    this.blocked_y_climb--;
  }

  onCollision(info: CollisionInfo): void {
    super.onCollision(info);
    let deltaV = info.getDeltaVSelf();
    let facing = this.stateMachine.getFacing();
    if (Math.abs(deltaV.y) < 0.01 && deltaV.normalize().dot(facing) < this.stateMachine.climbDotProductThreshold)
    {
      let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
      if (other?.body.isKinematic())
      {
        if (this.blocked_y_clamber <= 0 && this.stateMachine.clamberDetector !== undefined)
        {
          let pos = this.stateMachine.clamberDetector.body.getPosition().clone().add(Helpers.upVector.clone().multiplyScalar(this.stateMachine.detectorYOffset));
          let rcResult = GameplayScene.instance.clientInterface?.raycast(pos, Helpers.downVector, this.stateMachine.clamberDetector.body.id, true);
          if (rcResult?.body == other && rcResult.distance < this.stateMachine.climbDetectorMaxDistance)
          {
            this.stateMachine.climbTarget = other;
            this.stateMachine.climbTargetOffset = this.stateMachine.body.body.getPosition().clone().sub(other.body.getPosition()).applyQuaternion(other.body.getRotation().clone().invert());
            this.stateMachine.switchState("clamber");
            this.stateMachine.faceContactPoint(info.getContactPointOnSelf());
            // TODO: adjust starting point of clamber animation based on height difference
            return;
          }
        }
        if (this.blocked_y_climb <= 0 && this.stateMachine.climbDetector !== undefined)
        {
          let pos = this.stateMachine.climbDetector.body.getPosition().clone().add(Helpers.upVector.clone().multiplyScalar(this.stateMachine.detectorYOffset));
          let rcResult = GameplayScene.instance.clientInterface?.raycast(pos, Helpers.downVector, this.stateMachine.climbDetector.body.id, true);
          if (rcResult?.body == other && rcResult.distance < this.stateMachine.climbDetectorMaxDistance)
          {
            this.stateMachine.climbTarget = other;
            this.stateMachine.climbTargetOffset = this.stateMachine.body.body.getPosition().clone().sub(other.body.getPosition()).applyQuaternion(other.body.getRotation().clone().invert());
            this.stateMachine.switchState("climb");
            this.stateMachine.faceContactPoint(info.getContactPointOnSelf());
            // TODO: adjust starting point of climb animation based on height difference
            return;
          }
        }
      }
    }
  }

  onTrigger(source: LMent, triggerId: string): void {
    if (triggerId == "blocked_y_climb")
    {
      this.blocked_y_climb = 2;
    }
    else if (triggerId == "blocked_y_clamber")
    {
      this.blocked_y_clamber = 2;
    }
  }

  hasSubtype(subtype: string): boolean {
    return subtype == "blocked_y_climb" || subtype == "blocked_y_clamber";
  }
}

export class ClamberState extends StaggerableState
{
  lastTargetPosition: Vector3;
  timeInClamber : number = 0;

  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("clamber", stateMachine, shapeToAnimate, "clamber", stateMachine.baseBlendTime);
    this.lastTargetPosition = Helpers.NewVector3(0, 0, 0);
  }

  onEnterState(previousState: State | undefined): void {
    // super.onEnterState(previousState); // don't use super because we want to use the root motion flag on playAnimation
    if (this.shape)
    {
      this.shape.playAnimation(this.animName, this.animBlendTime, false, true);
    }
    this.stateMachine.body.body.setUseRootMotion(true, this.shape);
    this.stateMachine.body.body.setVelocity(Helpers.zeroVector);
    if (this.stateMachine.climbTarget && this.stateMachine.climbTargetOffset)
    {
      this.lastTargetPosition.copy(this.stateMachine.climbTargetOffset).applyQuaternion(this.stateMachine.climbTarget.body.getRotation()).add(this.stateMachine.climbTarget.body.getPosition());
      this.stateMachine.body.body.disableCollisionWith(this.stateMachine.climbTarget.body);
    }
    this.timeInClamber = 0;
  }

  onExitState(nextState: State | undefined): void {
    this.stateMachine.body.body.setUseRootMotion(false, undefined);
    if (this.stateMachine.climbTarget)
    {
      this.stateMachine.body.body.enableCollisionWith(this.stateMachine.climbTarget.body);
    }
  }

  onUpdate(dt: number): void
  {
    this.timeInClamber += dt;
    if (this.stateMachine.climbTarget !== undefined && this.stateMachine.climbTargetOffset !== undefined)
    {
      let targetPosition = this.stateMachine.climbTargetOffset.clone().applyQuaternion(this.stateMachine.climbTarget.body.getRotation()).add(this.stateMachine.climbTarget.body.getPosition());
      let delta = targetPosition.clone().sub(this.lastTargetPosition);
      let length = delta.length();

      if (length > this.stateMachine.climbTooFarThreshold)
      {
        this.stateMachine.switchState("fall");
        console.log("climb target moved too much; falling");
        return;
      }
      
      if (length > 0 && dt > 0)
      {
        this.stateMachine.body.body.setVelocity(delta.multiplyScalar(1 / dt));
      }
      else
      {
        this.stateMachine.body.body.setVelocity(Helpers.zeroVector);
      }

      this.lastTargetPosition.copy(targetPosition);
    }
    if (this.shape?.isAnimationFinished() || this.timeInClamber >= this.stateMachine.clamberCutoffTime)
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.switchState("jog");
      }
      else
      {
        this.stateMachine.switchState("idle");
      }
    }
  }
}


export class ClimbState extends StaggerableState
{
  lastTargetPosition: Vector3;
  timeInClimb: number = 0;

  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("climb", stateMachine, shapeToAnimate, "climb", stateMachine.baseBlendTime);
    this.lastTargetPosition = Helpers.NewVector3(0, 0, 0);
  }

  onEnterState(previousState: State | undefined): void {
    // super.onEnterState(previousState); // don't use super because we want to use the root motion flag on playAnimation
    if (this.shape)
    {
      this.shape.playAnimation(this.animName, this.animBlendTime, false, true);
    }
    this.stateMachine.body.body.setUseRootMotion(true, this.shape);
    this.stateMachine.body.body.setVelocity(Helpers.zeroVector);
    if (this.stateMachine.climbTarget && this.stateMachine.climbTargetOffset)
    {
      this.lastTargetPosition.copy(this.stateMachine.climbTargetOffset).applyQuaternion(this.stateMachine.climbTarget.body.getRotation()).add(this.stateMachine.climbTarget.body.getPosition());
      this.stateMachine.body.body.disableCollisionWith(this.stateMachine.climbTarget.body);
    }
    this.timeInClimb = 0;
  }

  onExitState(nextState: State | undefined): void {
    this.stateMachine.body.body.setUseRootMotion(false, undefined);
    if (this.stateMachine.climbTarget)
    {
      this.stateMachine.body.body.enableCollisionWith(this.stateMachine.climbTarget.body);
    }
  }

  onUpdate(dt: number): void
  {
    this.timeInClimb += dt;
    if (this.stateMachine.climbTarget !== undefined && this.stateMachine.climbTargetOffset !== undefined)
    {
      let targetPosition = this.stateMachine.climbTargetOffset.clone().applyQuaternion(this.stateMachine.climbTarget.body.getRotation()).add(this.stateMachine.climbTarget.body.getPosition());
      let delta = targetPosition.clone().sub(this.lastTargetPosition);
      let length = delta.length();

      if (length > this.stateMachine.climbTooFarThreshold)
      {
        this.stateMachine.switchState("fall");
        console.log("climb target moved too much; falling");
        return;
      }
      
      if (length > 0 && dt > 0)
      {
        this.stateMachine.body.body.setVelocity(delta.multiplyScalar(1 / dt));
      }
      else
      {
        this.stateMachine.body.body.setVelocity(Helpers.zeroVector);
      }

      this.lastTargetPosition.copy(targetPosition);
    }
    if (this.shape?.isAnimationFinished() || this.timeInClimb >= this.stateMachine.climbCutoffTime)
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.switchState("jog");
      }
      else
      {
        this.stateMachine.switchState("idle");
      }
    }
  }
}

export class LiftState extends StaggerableState
{
  liftedItem: BodyHandle | undefined;
  wasFragile: boolean = false;
  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("lift", stateMachine, shapeToAnimate, "lift", /*stateMachine.baseBlendTime*/0.0);
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    this.liftedItem = this.stateMachine.liftedItem;
    if (this.liftedItem)
    {
      this.liftedItem.body.setVelocity(this.stateMachine.body.body.getVelocity());
      this.liftedItem.body.setAngularVelocity(Helpers.zeroVector);
      this.stateMachine.body.body.addHoldConstraintWith(this.liftedItem.body, "item_node");
      let fragileElement = this.liftedItem.getElement(Fragile);
      if (fragileElement)
      {
        this.wasFragile = fragileElement.enabled;
        fragileElement.enabled = false;
      }
      else
      {
        this.wasFragile = false;
      }
    }
  }

  onExitState(nextState: State | undefined): void {
    if (this.liftedItem)
    {
      this.stateMachine.body.body.removeHoldConstraintWith(this.liftedItem.body);

      if (this.wasFragile)
      {
        let fragileElement = this.liftedItem.getElement(Fragile);
        if (fragileElement)
        {
          fragileElement.enabled = true;
        }
      }
    }
  }

  onActorDestroyed(actor: BodyHandle): void {
    if (actor == this.liftedItem)
    {
      this.stateMachine.switchState("idle");
    }
  }

  onUpdate(dt: number): void
  {
    if (this.shape?.isAnimationFinished())
    {
      this.stateMachine.switchState("idle_holding");
    }
  }
}

export class PlaceState extends StaggerableState
{
  liftedItem: BodyHandle | undefined;
  wasFragile: boolean = false;
  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("place", stateMachine, shapeToAnimate, "place", stateMachine.baseBlendTime);
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    this.liftedItem = this.stateMachine.liftedItem;
    if (this.liftedItem)
    {
      this.liftedItem.body.setVelocity(this.stateMachine.body.body.getVelocity());
      this.liftedItem.body.setAngularVelocity(Helpers.zeroVector);
      this.stateMachine.body.body.addHoldConstraintWith(this.liftedItem.body, "item_node");
      let fragileElement = this.liftedItem.getElement(Fragile);
      if (fragileElement)
      {
        this.wasFragile = fragileElement.enabled;
        fragileElement.enabled = false;
      }
      else
      {
        this.wasFragile = false;
      }
    }
  }

  onExitState(nextState: State | undefined): void {
    if (this.liftedItem)
    {
      this.stateMachine.body.body.removeHoldConstraintWith(this.liftedItem.body);

      if (this.wasFragile)
      {
        let fragileElement = this.liftedItem.getElement(Fragile);
        if (fragileElement)
        {
          fragileElement.enabled = true;
        }
      }
    }
  }

  onActorDestroyed(actor: BodyHandle): void {
    if (actor == this.liftedItem)
    {
      this.stateMachine.switchState("idle");
    }
  }

  onUpdate(dt: number): void
  {
    if (this.shape?.isAnimationFinished())
    {
      this.stateMachine.switchState("idle");
    }
  }
}

export class ThrowState extends StaggerableState
{
  timeInThrow: number = 0;
  liftedItem: BodyHandle | undefined;
  wasFragile: boolean = false;
  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("throw", stateMachine, shapeToAnimate, "throw", stateMachine.baseBlendTime);
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    this.liftedItem = this.stateMachine.liftedItem;
    if (this.liftedItem)
    {
      this.liftedItem.body.setVelocity(this.stateMachine.body.body.getVelocity());
      this.liftedItem.body.setAngularVelocity(Helpers.zeroVector);
      this.stateMachine.body.body.addHoldConstraintWith(this.liftedItem.body, "item_node");
      let fragileElement = this.liftedItem.getElement(Fragile);
      if (fragileElement)
      {
        this.wasFragile = fragileElement.enabled;
        fragileElement.enabled = false;
      }
      else
      {
        this.wasFragile = false;
      }
    }
    this.timeInThrow = 0;
  }

  onExitState(nextState: State | undefined): void {
    if (this.liftedItem)
    {
      this.stateMachine.body.body.removeHoldConstraintWith(this.liftedItem.body);

      if (this.wasFragile)
      {
        let fragileElement = this.liftedItem.getElement(Fragile);
        if (fragileElement)
        {
          fragileElement.enabled = true;
        }
      }
    }
  }

  onUpdate(dt: number): void
  {
    this.timeInThrow += dt;

    if (this.timeInThrow >= this.stateMachine.throwReleaseTime && this.liftedItem)
    {
      let gadget = this.liftedItem.getElement(AbstractGadget);
      if (gadget)
      {
        this.stateMachine.body.body.removeHoldConstraintWith(this.liftedItem.body);
        let direction = gadget.activate();
        if (direction)
        {
          this.stateMachine.setFacingAbsolute(direction.x, direction.z);
        }
      }
      this.liftedItem = undefined;
    }

    if (this.shape?.isAnimationFinished())
    {
      this.stateMachine.switchState("idle");
    }
  }

  onActorDestroyed(actor: BodyHandle): void {
    if (actor == this.liftedItem)
    {
      this.stateMachine.switchState("idle");
    }
  }
}

export class IdleHoldingState extends StaggerableState
{
  liftedItem: BodyHandle | undefined;
  wasJustJogging: number = 0;

  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("idle_holding", stateMachine, shapeToAnimate, "idle_holding", stateMachine.idleBlendTime);
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    this.liftedItem = this.stateMachine.liftedItem;
    if (this.liftedItem)
    {
      this.liftedItem.body.setVelocity(this.stateMachine.body.body.getVelocity());
      this.liftedItem.body.setAngularVelocity(Helpers.zeroVector);
      this.stateMachine.body.body.addHoldConstraintWith(this.liftedItem.body, "item_node");
    }
    if (previousState instanceof JogHoldingState)
    {
      this.wasJustJogging = 5;
    }
    else
    {
      this.wasJustJogging = 0;
    }
  }

  onExitState(nextState: State | undefined): void {
    if (this.liftedItem)
    {
      this.stateMachine.body.body.removeHoldConstraintWith(this.liftedItem.body);
    }
  }

  onUpdate(dt: number): void
  {
    if (this.stateMachine.lastOnGround > this.stateMachine.coyoteTime)
    {
      this.stateMachine.switchState("fall_holding");
    }
    else if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
    {
      this.stateMachine.switchState("jog_holding");
    }
    this.wasJustJogging--;
  }

  onActorDestroyed(actor: BodyHandle): void {
    if (actor == this.liftedItem)
    {
      this.stateMachine.switchState("idle");
    }
  }

  onTap()
  {
    if (this.wasJustJogging > 0)
    {
      if (this.liftedItem?.getElement(Throwable))
      {
        this.stateMachine.switchState("throw");
      }
      else
      {
        let gadget = this.liftedItem?.getElement(AbstractGadget);
        if (gadget)
        {
          let direction = gadget.activate();
          if (direction)
          {
            this.stateMachine.setFacingAbsolute(direction.x, direction.z);
          }
        }
      }
    }
    else
    {
      this.stateMachine.switchState("place");
    }
  }

  onSwipe(dx: number, dy: number)
  {
    this.stateMachine.setFacing(-dx, -dy);
    if (this.liftedItem?.getElement(Throwable))
    {
      this.stateMachine.switchState("throw");
    }
    else
    {
      let gadget = this.liftedItem?.getElement(AbstractGadget);
      if (gadget)
      {
        let direction = gadget.activate();
        if (direction)
        {
          this.stateMachine.setFacingAbsolute(direction.x, direction.z);
        }
      }
    }
  }
}

export class JogHoldingState extends StaggerableState
{
  timeInJog: number = 0;
  blocked_y_clamber: number = 2;
  liftedItem : BodyHandle | undefined;

  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("jog_holding", stateMachine, shapeToAnimate, "jog_holding", stateMachine.baseBlendTime);
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    this.blocked_y_clamber = 2;
    this.timeInJog = 0;
    this.liftedItem = this.stateMachine.liftedItem;
    if (this.liftedItem)
    {
      this.liftedItem.body.setVelocity(this.stateMachine.body.body.getVelocity());
      this.liftedItem.body.setAngularVelocity(Helpers.zeroVector);
      this.stateMachine.body.body.addHoldConstraintWith(this.liftedItem.body, "item_node");
    }
  }

  onExitState(nextState: State | undefined): void {
    if (this.liftedItem)
    {
      this.stateMachine.body.body.removeHoldConstraintWith(this.liftedItem.body);
    }
  }

  onUpdate(dt: number): void {
    if (this.stateMachine.autoJumpMinDistance > 0 && GameplayScene.instance.clientInterface && this.timeInJog > this.stateMachine.coyoteTime)
    {
      let intersection = GameplayScene.instance.clientInterface.raycast(this.stateMachine.body.body.getPosition(), Helpers.downVector, this.stateMachine.body.body.id, true);
      if (intersection.distance > this.stateMachine.autoJumpMinDistance)
      {
        this.stateMachine.switchState("jump_holding");
        return;
      }
    }

    if (this.stateMachine.lastOnGround > this.stateMachine.coyoteTime)
    {
      this.stateMachine.switchState("fall_holding");
    }
    else if (this.stateMachine.dragDx == 0 && this.stateMachine.dragDy == 0)
    {
      this.stateMachine.switchState("idle_holding");
    }
    else
    {
      this.stateMachine.accelerateWithParams(this.stateMachine.jogAcceleration, this.stateMachine.jogAccelerationSmoothFactor, this.stateMachine.jogMaxSpeed, dt);
    }

    this.blocked_y_clamber--;
    this.timeInJog += dt;
  }

  onCollision(info: CollisionInfo): void {
    super.onCollision(info);
    let deltaV = info.getDeltaVSelf();
    let facing = this.stateMachine.getFacing();
    if (Math.abs(deltaV.y) < 0.01 && deltaV.normalize().dot(facing) < this.stateMachine.climbDotProductThreshold)
    {
      let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
      if (other?.body.isKinematic())
      {
        if (this.blocked_y_clamber <= 0)
        {
          this.stateMachine.switchState("jump_holding");
        }
      }  
    }
  }

  onTrigger(source: LMent, triggerId: string): void {
    if (triggerId == "blocked_y_clamber")
    {
      this.blocked_y_clamber = 2;
    }
  }

  hasSubtype(subtype: string): boolean {
    return subtype == "blocked_y_clamber";
  }

  onTap()
  {
    if (this.liftedItem?.getElement(Throwable))
    {
      this.stateMachine.switchState("throw");
    }
    else
    {
      let gadget = this.liftedItem?.getElement(AbstractGadget);
      if (gadget)
      {
        let direction = gadget.activate();
        if (direction)
        {
          this.stateMachine.setFacingAbsolute(direction.x, direction.z);
        }
      }
    }
  }

  onSwipe(dx: number, dy: number)
  {
    this.stateMachine.setFacing(-dx, -dy);
    if (this.liftedItem?.getElement(Throwable))
    {
      this.stateMachine.switchState("throw");
    }
    else
    {
      let gadget = this.liftedItem?.getElement(AbstractGadget);
      if (gadget)
      {
        let direction = gadget.activate();
        if (direction)
        {
          this.stateMachine.setFacingAbsolute(direction.x, direction.z);
        }
      }
    }
  }

  onActorDestroyed(actor: BodyHandle): void {
    if (actor == this.liftedItem)
    {
      this.stateMachine.switchState("jog");
    }
  }
}

export class JumpHoldingState extends StaggerableState
{
  timeInJump: number;
  liftedItem: BodyHandle | undefined;

  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("jump_holding", stateMachine, shapeToAnimate, "jump_holding", stateMachine.baseBlendTime);
    this.timeInJump = 0;
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    let velocity = this.stateMachine.body.body.getVelocity();
    velocity.y += this.stateMachine.jumpInitialVelocity;
    this.stateMachine.body.body.setVelocity(velocity);
    this.stateMachine.lastOnGround = Infinity;
    this.timeInJump = 0;
    this.liftedItem = this.stateMachine.liftedItem;
    if (this.liftedItem)
    {
      this.liftedItem.body.setVelocity(this.stateMachine.body.body.getVelocity());
      this.liftedItem.body.setAngularVelocity(Helpers.zeroVector);
      this.stateMachine.body.body.addHoldConstraintWith(this.liftedItem.body, "item_node");
    }
  }

  onExitState(nextState: State | undefined): void {
    if (this.liftedItem)
    {
      this.stateMachine.body.body.removeHoldConstraintWith(this.liftedItem.body);
    }
  }

  onUpdate(dt: number): void {
    this.timeInJump += dt;
    if (this.stateMachine.lastOnGround == 0 && this.timeInJump >= this.stateMachine.coyoteTime)
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.switchState("jog_holding");
      }
      else
      {
        this.stateMachine.switchState("idle_holding");
      }
    }
    else if (this.stateMachine.body.body.getVelocity().y < this.stateMachine.jumpToFallThreshold)
    {
      this.stateMachine.switchState("fall_holding");
    }
    else
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.accelerateWithParams(this.stateMachine.midairAcceleration, this.stateMachine.midairAccelerationSmoothFactor, this.stateMachine.midairMaxSpeed, dt);
      }
      else
      {
        let body = this.stateMachine.body.body;
        let velocity = body.getVelocity().clone();
        let origY = velocity.y;
        velocity.y = 0; // ignore y axis
        let deceleration = this.stateMachine.midairDeceleration;
    
        if (velocity.length() > deceleration * dt)
        {
          velocity.add(velocity.clone().normalize().multiplyScalar(-1 * deceleration * dt));
          velocity.y = origY;
        }
        else
        {
          velocity.set(0,origY,0);
        }
        body.setVelocity(velocity);
      }
    }
  }

  onActorDestroyed(actor: BodyHandle): void {
    if (actor == this.liftedItem)
    {
      this.stateMachine.switchState("fall");
    }
  }
}

export class FallHoldingState extends StaggerableState
{
  liftedItem: BodyHandle | undefined;

  constructor(stateMachine: AdventurerAvatar, shapeToAnimate: ShapePointer | undefined)
  {
    super("fall_holding", stateMachine, shapeToAnimate, "fall_holding", stateMachine.baseBlendTime);
  }

  onEnterState(previousState: State | undefined): void {
    super.onEnterState(previousState);
    this.stateMachine.lastOnGround = Infinity;
    this.liftedItem = this.stateMachine.liftedItem;
    if (this.liftedItem)
    {
      this.liftedItem.body.setVelocity(this.stateMachine.body.body.getVelocity());
      this.liftedItem.body.setAngularVelocity(Helpers.zeroVector);
      this.stateMachine.body.body.addHoldConstraintWith(this.liftedItem.body, "item_node");
    }
  }

  onExitState(nextState: State | undefined): void {
    if (this.liftedItem)
    {
      this.stateMachine.body.body.removeHoldConstraintWith(this.liftedItem.body);
    }
  }

  onUpdate(dt: number): void {
    if (this.stateMachine.lastOnGround == 0)
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.switchState("jog_holding");
      }
      else
      {
        this.stateMachine.switchState("idle_holding");
      }
    }
    else
    {
      if (this.stateMachine.dragDx != 0 || this.stateMachine.dragDy != 0)
      {
        this.stateMachine.accelerateWithParams(this.stateMachine.midairAcceleration, this.stateMachine.midairAccelerationSmoothFactor, this.stateMachine.midairMaxSpeed, dt);
      }
      else
      {
        let body = this.stateMachine.body.body;
        let velocity = body.getVelocity().clone();
        let origY = velocity.y;
        velocity.y = 0; // ignore y axis
        let deceleration = this.stateMachine.midairDeceleration;
    
        if (velocity.length() > deceleration * dt)
        {
          velocity.add(velocity.clone().normalize().multiplyScalar(-1 * deceleration * dt));
          velocity.y = origY;
        }
        else
        {
          velocity.set(0,origY,0);
        }
        body.setVelocity(velocity);
      }
    }
  }

  onActorDestroyed(actor: BodyHandle): void {
    if (actor == this.liftedItem)
    {
      this.stateMachine.switchState("fall");
    }
  }
}

export class AdventurerAvatar extends AvatarBase
{
  // configurable fields
  forceStaggerThreshold : number;

  jogAcceleration: number;
  jogAccelerationSmoothFactor: number;
  jogMaxSpeed: number;

  midairAcceleration: number;
  midairAccelerationSmoothFactor: number;
  midairMaxSpeed: number;

  idleDeceleration: number;
  midairDeceleration: number;

  jumpInitialVelocity: number;
  autoJumpMinDistance: number;
  jumpToFallThreshold : number;

  baseBlendTime : number;
  idleBlendTime : number;
  coyoteTime : number;

  climbTooFarThreshold : number;
  climbDotProductThreshold : number;

  climbDetectorMaxDistance : number;

  detectorYOffset : number;

  cameraRotationDelayOnFlip: number;
  flipDotProductThreshold: number;

  throwReleaseTime: number;

  climbCutoffTime : number;
  clamberCutoffTime : number;

  climbDetectorPrefab : string;
  clamberDetectorPrefab : string;
  jumpDetectorPrefab : string;
  cameraGuidePrefab : string;

  // runtime fields
  lastOnGround : number = Infinity;

  climbTarget: BodyHandle | undefined = undefined;
  climbTargetOffset: Vector3 | undefined = undefined;
  clamberDetector: BodyHandle | undefined = undefined;
  climbDetector: BodyHandle | undefined = undefined;
  jumpDetector: BodyHandle | undefined = undefined;
  cameraGuide: BodyHandle | undefined = undefined;
  liftedItem: BodyHandle | undefined = undefined;
  myGuideElement: GuideBody | undefined = undefined;

  cameraRotationDelayTimer: number = 0;

  constructor(body: BodyHandle, id: number, params: Partial<AdventurerAvatar> = {})
  {
    super(body, id, params);

    this.forceStaggerThreshold = params.forceStaggerThreshold ?? 10;

    this.jogAcceleration = params.jogAcceleration ?? 50;
    this.jogAccelerationSmoothFactor = params.jogAccelerationSmoothFactor ?? 0.25;
    this.jogMaxSpeed = params.jogMaxSpeed ?? 5;
    
    this.midairAcceleration = params.midairAcceleration ?? 15;
    this.midairMaxSpeed = params.midairMaxSpeed ?? 5;
    this.midairAccelerationSmoothFactor = params.jogAccelerationSmoothFactor ?? 0.5;
    
    this.idleDeceleration = params.idleDeceleration ?? 20;
    this.midairDeceleration  = params.midairDeceleration ?? 5;

    this.jumpInitialVelocity = params.jumpInitialVelocity ?? 9;
    this.autoJumpMinDistance = params.autoJumpMinDistance ?? 3;
    this.jumpToFallThreshold = params.jumpToFallThreshold ?? -9.0;

    this.baseBlendTime = params.baseBlendTime ?? 0.1;
    this.idleBlendTime = params.idleBlendTime ?? 0.25;
    this.coyoteTime = params.coyoteTime ?? 0.1;

    this.climbTooFarThreshold = params.climbTooFarThreshold ?? 1;
    this.climbDotProductThreshold = params.climbDotProductThreshold ?? -0.6;

    this.climbDetectorMaxDistance = params.climbDetectorMaxDistance ?? 0.5;

    this.cameraRotationDelayOnFlip = params.cameraRotationDelayOnFlip === undefined ? 3 : params.cameraRotationDelayOnFlip;
    this.flipDotProductThreshold = params.flipDotProductThreshold ?? 0.75;

    this.throwReleaseTime = params.throwReleaseTime ?? 0.2;

    this.climbCutoffTime = params.climbCutoffTime ?? 0.8;
    this.clamberCutoffTime = params.clamberCutoffTime ?? 0.6;

    this.detectorYOffset = params.detectorYOffset ?? -0.7349385521597851;

    this.climbDetectorPrefab = params.climbDetectorPrefab ?? "ClimbDetector";
    this.clamberDetectorPrefab = params.clamberDetectorPrefab ?? "ClamberDetector";
    this.jumpDetectorPrefab = params.jumpDetectorPrefab ?? "JumpDetector";
    this.cameraGuidePrefab = params.cameraGuidePrefab ?? "CameraGuide_v2";
  }

  accelerateWithParams(acceleration: number, smoothFactor: number, maxSpeed: number, dt: number)
  {
    this.setFacing(-this.dragDx, -this.dragDy);

    let facing = this.getFacing();
    let targetVelocity : Vector3;
    let currentPlanarVelocity = this.getPlanarVelocity();

    let isTurnaround = facing.dot(currentPlanarVelocity) < 0;

    let speedLerp = Math.sqrt(this.dragDx * this.dragDx + this.dragDy * this.dragDy);

    if (speedLerp > 0.99 && !isTurnaround)
    {
      // if avatar is moving in the target direction faster than the max speed, allow them to continue moving at that speed and adjust
      // their velocity toward the target direction
      let projectedVelocity = currentPlanarVelocity.clone().projectOnVector(facing);
      let projectedSpeed = projectedVelocity.length();
      if (projectedSpeed > maxSpeed)
      {
        targetVelocity = projectedVelocity;
      }
      else
      {
        targetVelocity = facing.clone().multiplyScalar(maxSpeed * speedLerp);
      }
    }
    else
    {
      if (currentPlanarVelocity.dot(facing) > 0)
      {
        currentPlanarVelocity.projectOnVector(facing);
      }
      else
      {
        currentPlanarVelocity.copy(Helpers.zeroVector);
      }
      targetVelocity = facing.clone()
        .multiplyScalar(maxSpeed * speedLerp * (1 - smoothFactor))
        .add(currentPlanarVelocity.clone().multiplyScalar(smoothFactor));
    }

    let delta = targetVelocity.clone().sub(currentPlanarVelocity);
    
    if (delta.length() < acceleration * dt)
    {
      targetVelocity.y = this.body.body.getVelocity().y;
      this.body.body.setVelocity(targetVelocity);
    }
    else
    {
      let accelerationVector = delta.normalize().multiplyScalar(acceleration * dt);
      this.body.body.setVelocity(this.body.body.getVelocity().add(accelerationVector));
    }
  }

  onInit()
  {
    super.onInit();

    this.clamberDetector = GameplayScene.instance.clonePrefab(this.clamberDetectorPrefab);
    this.climbDetector = GameplayScene.instance.clonePrefab(this.climbDetectorPrefab);
    this.jumpDetector = GameplayScene.instance.clonePrefab(this.jumpDetectorPrefab);
    this.cameraGuide = GameplayScene.instance.clonePrefab(this.cameraGuidePrefab);
    
    if (this.cameraGuide)
    {
      this.myGuideElement = this.cameraGuide.getElement(GuideBody);
      this.camGuide = this.myGuideElement;
      if (this.camGuide)
      {
        this.camTarget = this.camGuide.body.getElement(CameraTarget);
      }
    }

    this.body.body.lockRotation(true, true, true);

    let shape = this.body.body.getShapes()[0];

    this.states = {
      idle: new IdleState(this, shape),
      jog: new JogState(this, shape),
      jump: new JumpState(this, shape),
      fall: new FallState(this, shape),
      clamber: new ClamberState(this, shape),
      climb: new ClimbState(this, shape),
      lift: new LiftState(this, shape),
      place: new PlaceState(this, shape),
      throw: new ThrowState(this, shape),
      idle_holding: new IdleHoldingState(this, shape),
      jog_holding: new JogHoldingState(this, shape),
      jump_holding: new JumpHoldingState(this, shape),
      fall_holding: new FallHoldingState(this, shape),
    }

    this.switchState("idle");
  }

  onStart(): void {
    super.onStart();
  }

  canInteract(): boolean
  {
    return this.currentState?.name == "idle" || this.currentState?.name == "jog";
  }

  highlightInteractableObject()
  {
    let interactables = GameplayScene.instance.dispatcher.getInteractables().filter((i) => i.isInInteractionRange(this.body));

    let maxPriority = -Infinity;
    let selectedInteractable : InteractHandler | undefined = undefined;

    for (let interactable of interactables)
    {
      if (interactable.interactionPriority > maxPriority)
      {
        maxPriority = interactable.interactionPriority;
        selectedInteractable = interactable;
      }
    }

    if (selectedInteractable instanceof LMent)
    {
      selectedInteractable.body.body.showHighlight();
    }
  }

  pickUpItem(item: AbstractGadget)
  {
    if (!this.canInteract())
    {
      return;
    }
    this.liftedItem = item.body;
    this.switchState("lift");
  }

  onCollision(info: CollisionInfo): void {
    let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());

    if (other === undefined || !other.body.isHologram())
    {
      let direction = info.getDeltaVSelf().normalize();
      if (direction.dot(Helpers.upVector) > 0.7)
      {
        this.lastOnGround = 0;
        this.isOnGround = true;
      }
    }

    super.onCollision(info);
  }

  onUpdate(dt: number): void {
    super.onUpdate(dt);
    this.lastOnGround += dt;
    if (this.lastOnGround > dt)
    {
      this.isOnGround = false;
    }

    let dragVec = Helpers.NewVector3(this.dragDx, 0, this.dragDy);

    let isFlipping = dragVec.dot(Helpers.forwardVector) > this.flipDotProductThreshold;

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

    if (this.canInteract())
    {
      this.highlightInteractableObject();
    }
  }

  faceContactPoint(pointOnSelf : Vector3)
  {
    let angle = Math.atan2(pointOnSelf.x, pointOnSelf.z);
    let quat = Helpers.NewQuaternion().setFromAxisAngle(Helpers.upVector, angle);
    quat.premultiply(this.body.body.getRotation());
    this.body.body.setRotation(quat);
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

  setFacingAbsolute(dx : number, dy: number)
  {
    let angle = Math.atan2(dx, dy);
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

  postReviveCallback() {
    super.postReviveCallback();
    let fallState = this.getState("fall") as FallState;
    let oldBlendTime = fallState.animBlendTime;
    fallState.animBlendTime = 0;
    this.switchState("fall");
    fallState.animBlendTime = oldBlendTime;
  }

  lose()
  {
    super.lose();
    if (this.liftedItem)
    {
      // item isn't necessarily destroyed, but behave as though it was in order to destroy constraint and drop it
      this.onActorDestroyed(this.liftedItem);
    }
  }
}