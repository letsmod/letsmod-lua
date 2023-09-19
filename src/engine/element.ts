import { BodyHandle } from "./bodyHandle";
import { Vector3 } from "three";

export interface UpdateHandler extends Element
{
  onUpdate() : void;
}

export interface CollisionHandler extends Element
{
  onCollision(other : BodyHandle, contactPoint: Vector3, contactImpulse : Vector3) : void;
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
  onInteract(player : BodyHandle) : void;
}

export abstract class Element
{
  body : BodyHandle;

  constructor(body : BodyHandle)
  {
    this.body = body;
    this.body.elements.push(this);
  }

  /*
    Called immediately when the body this element belongs to is created
  */
  abstract onInit() : void;

  /*
    Called on the first frame the body exists in the scene.  Always called after the onInit() calls for each body in the scene.
  */
  abstract onStart() : void;
}

class foo extends Element implements ButtonHandler, UpdateHandler
{
  constructor(body : BodyHandle, params: {hi: number, ok: string})
  {
    super(body);
  }

  onButtonPress(button: string)
  {

  }
  
  onButtonHold(button: string)
  {

  }

  onButtonRelease(button: string)
  {
    
  }

  onInit()
  {

  }

  onStart()
  {

  }

  onUpdate()
  {

  }
}