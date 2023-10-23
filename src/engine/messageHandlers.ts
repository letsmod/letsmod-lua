import { LMent } from "./LMent";
import { BodyHandle } from "./BodyHandle";

export interface UpdateHandler extends LMent
{
  onUpdate() : void;
}

export interface CollisionHandler extends LMent
{
  onCollision(other : BodyHandle | undefined, contactPoint: THREE.Vector3, contactDeltaV : THREE.Vector3) : void;
}

export interface ButtonHandler extends LMent
{
  onButtonPress(button: string) : void;
  onButtonHold(button: string) : void;
  onButtonRelease(button: string) : void;
}

export interface DragGestureHandler extends LMent
{
  onDragStart(dx: number, dy: number) : void;
  onDrag(dx: number, dy: number) : void;
  onDragRelease(dx: number, dy: number) : void;
}

export interface TapGestureHandler extends LMent
{
  onTap() : void;
}

export interface SwipeGestureHandler extends LMent
{
  onSwipe(dx: number, dy: number) : void;
}

export interface HoldGestureHandler extends LMent
{
  onHoldStart() : void;
  onHoldRelease() : void;
}

export interface AimGetstureHandler extends LMent
{
  onAimStart() : void; // always starts with dx=0, dy=0
  onAim(dx: number, dy: number) : void;
  onAimRelease(dx: number, dy: number) : void;
}

export interface InteractHandler extends LMent
{
  interactionNameOrIcon : string;
  interactionPriority : number;

  isInInteractionRange(interactor : BodyHandle) : boolean;

  onInteract(interactor : BodyHandle) : boolean;
}

export interface ActorDestructionHandler extends LMent
{
  onActorDestroyed(actor: BodyHandle) : void;
}

export interface HitPointChangeHandler extends LMent
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