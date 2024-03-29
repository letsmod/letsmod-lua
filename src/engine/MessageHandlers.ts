import { LMent } from "./LMent";
import { BodyHandle } from "./BodyHandle";

export interface GenericHandler
{
  // override this function for listeners (such as button listeners) with subtypes
  hasSubtype? (subtype : string) : boolean;
}

export interface UpdateHandler extends GenericHandler
{
  onUpdate(dt? : number) : void;
}

export interface PhysicsSubstepHandler extends GenericHandler
{
  onPhysicsSubstep(substepDt? : number) : void;
}

export interface CollisionInfo
{
  getOtherObjectId() : number;

  getImpulse() : THREE.Vector3;
  getDeltaVSelf() : THREE.Vector3;
  getDeltaVOther() : THREE.Vector3;
  getDeltaVRelative() : THREE.Vector3;

  getContactPointOnSelf(): THREE.Vector3;
  getContactPointOnOther(): THREE.Vector3;
}

export interface CollisionInfoFactory
{
  aId: number;
  bId: number;

  makeCollisionInfo(target: "a" | "b") : CollisionInfo;
}

export interface CollisionHandler extends GenericHandler
{
  onCollision(info: CollisionInfo) : void;
}

export interface ButtonHandler extends GenericHandler
{
  onButtonPress(button: string) : void;
  onButtonHold(button: string) : void;
  onButtonRelease(button: string) : void;
  hasSubtype(button: string) : boolean;
}

export interface DragGestureHandler extends GenericHandler
{
  onDrag(dx: number, dy: number) : void;
}

export interface TapGestureHandler extends GenericHandler
{
  onTap() : void;
}

export interface SwipeGestureHandler extends GenericHandler
{
  onSwipe(dx: number, dy: number) : void;
}

export interface HoldGestureHandler extends GenericHandler
{
  onHoldStart() : void;
  onHoldRelease() : void;
}

export interface AimGetstureHandler extends GenericHandler
{
  onAimStart() : void; // always starts with dx=0, dy=0
  onAim(dx: number, dy: number) : void;
  onAimRelease(dx: number, dy: number) : void;
}

export interface InteractHandler extends GenericHandler
{
  interactionNameOrIcon : string;
  interactionPriority : number;

  isInInteractionRange(interactor : BodyHandle) : boolean;

  onInteract(interactor : BodyHandle) : boolean;

  highlightInteractable?() : void;
}

export interface ActorDestructionHandler extends GenericHandler
{
  onActorDestroyed(actor: BodyHandle) : void;
}

export interface HitPointChangeHandler extends GenericHandler
{
  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number) : void;
}

export interface TriggerHandler extends GenericHandler
{
  hasSubtype(trigger: string) : boolean;

  receivesTriggersWhenDisabled?: boolean;

  onTrigger(source: LMent, triggerId: string) : void;
}

export interface ActorTappedHandler extends GenericHandler
{
  onActorTapped(actor: BodyHandle) : void;
}

export type HandlerTypeMap = {
  update: UpdateHandler,
  physicsSubstep: PhysicsSubstepHandler,
  collision: CollisionHandler,
  button: ButtonHandler,
  drag: DragGestureHandler,
  tap: TapGestureHandler,
  swipe: SwipeGestureHandler,
  hold: HoldGestureHandler,
  aim: AimGetstureHandler,
  interact: InteractHandler,
  actorDestroyed: ActorDestructionHandler,
  hitPointsChanged: HitPointChangeHandler,
  trigger: TriggerHandler,
  actorTapped: ActorTappedHandler,
}

export type HandlerKey = keyof HandlerTypeMap;

export const HandlerTypes : HandlerKey[] = [
  "update",
  "physicsSubstep",
  "collision",
  "button",
  "drag",
  "tap",
  "swipe",
  "hold",
  "aim",
  "interact",
  "actorDestroyed",
  "hitPointsChanged",
  "trigger",
  "actorTapped",
]