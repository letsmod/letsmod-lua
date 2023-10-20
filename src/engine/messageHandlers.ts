import { Element } from "./Element";
import { BodyHandle } from "./BodyHandle";

export interface UpdateHandler extends Element
{
  onUpdate() : void;
}

export interface CollisionHandler extends Element
{
  onCollision(other : BodyHandle | undefined, contactPoint: THREE.Vector3, contactDeltaV : THREE.Vector3) : void;
}

export interface ButtonHandler extends Element
{
  onButtonPress(button: string) : void;
  onButtonHold(button: string) : void;
  onButtonRelease(button: string) : void;
}

export interface DragGestureHandler extends Element
{
  onDragStart(dx: number, dy: number) : void;
  onDrag(dx: number, dy: number) : void;
  onDragRelease(dx: number, dy: number) : void;
}

export interface TapGestureHandler extends Element
{
  onTap() : void;
}

export interface SwipeGestureHandler extends Element
{
  onSwipe(dx: number, dy: number) : void;
}

export interface HoldGestureHandler extends Element
{
  onHoldStart() : void;
  onHoldRelease() : void;
}

export interface AimGetstureHandler extends Element
{
  onAimStart() : void; // always starts with dx=0, dy=0
  onAim(dx: number, dy: number) : void;
  onAimRelease(dx: number, dy: number) : void;
}

export interface InteractHandler extends Element
{
  interactionNameOrIcon : string;
  interactionPriority : number;

  isInInteractionRange(interactor : BodyHandle) : boolean;

  onInteract(interactor : BodyHandle) : boolean;
}

export interface ActorDestructionHandler extends Element
{
  onActorDestroyed(actor: BodyHandle) : void;
}

export interface HitPointChangeHandler extends Element
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