import { LMent } from "./LMent";
import { BodyHandle } from "./BodyHandle";

export interface GenericHandler extends LMent
{
  // override this function for listeners (such as button listeners) with subtypes
  hasSubtype? (subtype : string) : boolean;
}

export interface UpdateHandler extends GenericHandler
{
  onUpdate() : void;
}

export interface CollisionHandler extends GenericHandler
{
  onCollision(other : BodyHandle | undefined, contactPoint: THREE.Vector3, contactDeltaV : THREE.Vector3) : void;
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
  onDragStart(dx: number, dy: number) : void;
  onDrag(dx: number, dy: number) : void;
  onDragRelease(dx: number, dy: number) : void;
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
}

export interface ActorDestructionHandler extends GenericHandler
{
  onActorDestroyed(actor: BodyHandle) : void;
}

export interface HitPointChangeHandler extends GenericHandler
{
  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number) : void;
}

export type HandlerTypeMap = {
  update: UpdateHandler,
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
}

export type HandlerKey = keyof HandlerTypeMap;

export const HandlerTypes : HandlerKey[] = [
  "update",
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
]