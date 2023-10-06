import { Element } from "./element";
import {
  UpdateHandler,
  CollisionHandler,
  ButtonHandler,
  DragGestureHandler,
  TapGestureHandler,
  SwipeGestureHandler,
  HoldGestureHandler,
  AimGetstureHandler,
  InteractHandler,
  SelfDestructionHandler,
  ActorDestructionHandler,
  HitPointChangeHandler
} from "./messageHandlers";
import { Vector3, Object3D } from "three";
import { BodyHandle } from "./bodyHandle";
import { GameplayScene } from "./gameplayScene";

export class MessageDispatcher
{
  updateListeners : UpdateHandler[] = [];
  collisionListeners : CollisionHandler[] = [];
  buttonListeners : ButtonHandler[] = [];
  dragGestureListeners : DragGestureHandler[] = [];
  tapGestureListeners : TapGestureHandler[] = [];
  swipeGestureListeners : SwipeGestureHandler[] = [];
  holdGestureListeners : HoldGestureHandler[] = [];
  aimGestureListeners : AimGetstureHandler[] = [];
  interactListeners : InteractHandler[] = [];
  selfDestructionListeners : SelfDestructionHandler[] = [];
  actorDestructionListeners : ActorDestructionHandler[] = [];
  hitpointChangeListeners : HitPointChangeHandler[] = [];

  constructor()
  {
  }

  clear()
  {
    this.updateListeners = [];
    this.collisionListeners = [];
    this.buttonListeners = [];
    this.dragGestureListeners = [];
    this.tapGestureListeners = [];
    this.swipeGestureListeners = [];
    this.holdGestureListeners = [];
    this.aimGestureListeners = [];
    this.interactListeners = [];
    this.selfDestructionListeners = [];
    this.actorDestructionListeners = [];
    this.hitpointChangeListeners = [];
  }

  // UpdateHandler

  addUpdateListener(listener : UpdateHandler)
  {
    this.updateListeners.push(listener);
  }
  
  removeUpdateListener(listener : UpdateHandler)
  {
    let index = this.updateListeners.indexOf(listener);
    if (index >= 0)
    {
      this.updateListeners.splice(index, 1);
    }
  }

  onUpdate()
  {
    for (var listener of this.updateListeners)
    {
      listener.onUpdate();
    }
  }

  // CollisionHandler

  addCollisionListener(listener : CollisionHandler)
  {
    this.collisionListeners.push(listener);
  }

  removeCollisionListener(listener : CollisionHandler)
  {
    let index = this.collisionListeners.indexOf(listener);
    if (index >= 0)
    {
      this.collisionListeners.splice(index, 1);
    }
  }

  onCollision = (() =>
  {
    let dummyVector3 = new Vector3();

    return (a: Object3D, b : Object3D, contactPointOnA: Vector3, contactPointOnB: Vector3, contactImpulse : Vector3) =>
    {
      for (var listener of this.collisionListeners)
      {
        if (listener.body.body.id == a.id)
        {
          let bBody = GameplayScene.instance.getBodyById(b.id);
          if (bBody)
          {
            listener.onCollision(bBody, contactPointOnA, dummyVector3.copy(contactImpulse));
          }
        }
        else if (listener.body.body.id == b.id)
        {
          let aBody = GameplayScene.instance.getBodyById(b.id);
          if (aBody)
          {
            listener.onCollision(aBody, contactPointOnB, dummyVector3.copy(contactImpulse).multiplyScalar(-1));
          }
        }
      }
    }
  })();

  // ButtonHandler

  addButtonListener(listener : ButtonHandler)
  {
    this.buttonListeners.push(listener);
  }
  
  removeButtonListener(listener : ButtonHandler)
  {
    let index = this.buttonListeners.indexOf(listener);
    if (index >= 0)
    {
      this.buttonListeners.splice(index, 1);
    }
  }

  onButtonPress(button: string)
  {
    for (var listener of this.buttonListeners)
    {
      listener.onButtonPress(button);
    }
  }

  onButtonHold(button: string)
  {
    for (var listener of this.buttonListeners)
    {
      listener.onButtonHold(button);
    }
  }

  onButtonRelease(button: string)
  {
    for (var listener of this.buttonListeners)
    {
      listener.onButtonRelease(button);
    }
  }

  // DragGestureHandler

  addDragGestureListener(listener : DragGestureHandler)
  {
    this.dragGestureListeners.push(listener);
  }

  removeDragGestureListener(listener : DragGestureHandler)
  {
    let index = this.dragGestureListeners.indexOf(listener);
    if (index >= 0)
    {
      this.dragGestureListeners.splice(index, 1);
    }
  }

  onDragStart(dx: number, dy: number)
  {
    for (var listener of this.dragGestureListeners)
    {
      listener.onDragStart(dx, dy);
    }
  }

  onDrag(dx: number, dy: number)
  {
    for (var listener of this.dragGestureListeners)
    {
      listener.onDrag(dx, dy);
    }
  }

  onDragRelease(dx: number, dy: number)
  {
    for (var listener of this.dragGestureListeners)
    {
      listener.onDragRelease(dx, dy);
    }
  }

  // TapGestureHandler

  addTapGestureListener(listener : TapGestureHandler)
  {
    this.tapGestureListeners.push(listener);
  }

  removeTapGestureListener(listener : TapGestureHandler)
  {
    let index = this.tapGestureListeners.indexOf(listener);
    if (index >= 0)
    {
      this.tapGestureListeners.splice(index, 1);
    }
  }

  onTap()
  {
    for (var listener of this.tapGestureListeners)
    {
      listener.onTap();
    }
  }

  // SwipeGestureHandler

  addSwipeGestureListener(listener : SwipeGestureHandler)
  {
    this.swipeGestureListeners.push(listener);
  }

  removeSwipeGestureListener(listener : SwipeGestureHandler)
  {
    let index = this.swipeGestureListeners.indexOf(listener);
    if (index >= 0)
    {
      this.swipeGestureListeners.splice(index, 1);
    }
  }

  onSwipe(dx: number, dy: number)
  {
    for (var listener of this.swipeGestureListeners)
    {
      listener.onSwipe(dx, dy);
    }
  }

  // HoldGestureHandler

  addHoldGestureListener(listener : HoldGestureHandler)
  {
    this.holdGestureListeners.push(listener);
  }

  removeHoldGestureListener(listener : HoldGestureHandler)
  {
    let index = this.holdGestureListeners.indexOf(listener);
    if (index >= 0)
    {
      this.holdGestureListeners.splice(index, 1);
    }
  }

  onHoldStart()
  {
    for (var listener of this.holdGestureListeners)
    {
      listener.onHoldStart();
    }
  }

  onHoldRelease()
  {
    for (var listener of this.holdGestureListeners)
    {
      listener.onHoldRelease();
    }
  }

  // AimGestureHandler

  addAimGestureListener(listener : AimGetstureHandler)
  {
    this.aimGestureListeners.push(listener);
  }

  removeAimGestureListener(listener : AimGetstureHandler)
  {
    let index = this.aimGestureListeners.indexOf(listener);
    if (index >= 0)
    {
      this.aimGestureListeners.splice(index, 1);
    }
  }

  onAimStart()
  {
    for (var listener of this.aimGestureListeners)
    {
      listener.onAimStart();
    }
  }

  onAim(dx: number, dy: number)
  {
    for (var listener of this.aimGestureListeners)
    {
      listener.onAim(dx, dy);
    }
  }

  onAimRelease(dx: number, dy: number)
  {
    for (var listener of this.aimGestureListeners)
    {
      listener.onAimRelease(dx, dy);
    }
  }

  // InteractHandler

  addInteractListener(listener : InteractHandler)
  {
    this.interactListeners.push(listener);
  }

  removeInteractListener(listener : InteractHandler)
  {
    let index = this.interactListeners.indexOf(listener);
    if (index >= 0)
    {
      this.interactListeners.splice(index, 1);
    }
  }

  // TBD: determine how to assign interactors to interactables such that the highest priority one in range is chosen

  onInteract(interactor : BodyHandle)
  {
    for (var listener of this.interactListeners)
    {
      if (listener.isInInteractionRange(interactor))
      {
        listener.onInteract(interactor);
      }
    }
  }

  // SelfDestructionHandler

  addSelfDestructionListener(listener : SelfDestructionHandler)
  {
    this.selfDestructionListeners.push(listener);
  }

  removeSelfDestructionListener(listener : SelfDestructionHandler)
  {
    let index = this.selfDestructionListeners.indexOf(listener);
    if (index >= 0)
    {
      this.selfDestructionListeners.splice(index, 1);
    }
  }

  onSelfDestruction()
  {
    for (var listener of this.selfDestructionListeners)
    {
      listener.onSelfDestruct();
    }
  }

  // ActorDestructionHandler

  addActorDestructionListener(listener : ActorDestructionHandler)
  {
    this.actorDestructionListeners.push(listener);
  }

  removeActorDestructionListener(listener : ActorDestructionHandler)
  {
    let index = this.actorDestructionListeners.indexOf(listener);
    if (index >= 0)
    {
      this.actorDestructionListeners.splice(index, 1);
    }
  }

  onActorDestruction(actor : BodyHandle)
  {
    for (var listener of this.actorDestructionListeners)
    {
      listener.onActorDestruct(actor);
    }
  }

  // HitPointChangeHandler

  addHitPointChangeListener(listener : HitPointChangeHandler)
  {
    this.hitpointChangeListeners.push(listener);
  }

  removeHitPointChangeListener(listener : HitPointChangeHandler)
  {
    let index = this.hitpointChangeListeners.indexOf(listener);
    if (index >= 0)
    {
      this.hitpointChangeListeners.splice(index, 1);
    }
  }

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number)
  {
    for (var listener of this.hitpointChangeListeners)
    {
      listener.onHitPointChange(source, previousHP, currentHP);
    }
  }
}