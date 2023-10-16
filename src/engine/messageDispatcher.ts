
import { js_new, global } from "js";
import {
  HandlerTypeMap,
  HandlerTypes
  // UpdateHandler,
  // CollisionHandler,
  // ButtonHandler,
  // DragGestureHandler,
  // TapGestureHandler,
  // SwipeGestureHandler,
  // HoldGestureHandler,
  // AimGetstureHandler,
  // InteractHandler,
  // SelfDestructionHandler,
  // ActorDestructionHandler,
  // HitPointChangeHandler
} from "./MessageHandlers";
import { BodyHandle } from "./BodyHandle";
import { GameplayScene } from "./GameplayScene";

export type ListenerDict = {
  [key in keyof HandlerTypeMap]: HandlerTypeMap[key][]
}

export function MakeListenerDict()
{
  let dict : Partial<ListenerDict> = {};

  for (let key of HandlerTypes)
  {
    dict[key] = [];
  }

  return dict as ListenerDict;
}

export class MessageDispatcher
{
  scene: GameplayScene;
  listeners : ListenerDict = MakeListenerDict();

  constructor(scene: GameplayScene)
  {
    this.scene = scene;
  }

  clearListeners()
  {
    this.listeners = MakeListenerDict();
  }

  removeAllListenersFromBody(body: BodyHandle)
  {
    for (let key in this.listeners)
    {
      let listeners = this.listeners[key as keyof HandlerTypeMap];
      for (let i = 0; i < listeners.length; i++)
      {
        if (listeners[i].body == body)
        {
          listeners.splice(i, 1);
          i--;
        }
      }
    }
  }
  
  removeAllListenersFromElement(elem : Element)
  {
    for (let key in this.listeners)
    {
      let listeners = this.listeners[key as keyof HandlerTypeMap];
      for (let i = 0; i < listeners.length; i++)
      {
        if (listeners[i] === elem as any)
        {
          listeners.splice(i, 1);
          i--;
        }
      }
    } 
  }

  removeListener<T extends keyof HandlerTypeMap>(type: T, listener: HandlerTypeMap[T])
  {
    let listeners = this.listeners[type];
    let index = listeners.indexOf(listener);
    if (index >= 0)
    {
      listeners.splice(index, 1);
    }
  }

  addListener<T extends keyof HandlerTypeMap>(type: T, listener: HandlerTypeMap[T])
  {
    this.listeners[type].push(listener);
  }

  // UpdateHandler

  onUpdate()
  {
    for (let listener of this.listeners["update"])
    {
      listener.onUpdate();
    }
  }

  // CollisionHandler

  onCollision = (() =>
  {
    let dummyVector3 = js_new(global.THREE.Vector3);

    return (a: THREE.Object3D, b : THREE.Object3D, contactPointOnA: THREE.Vector3, contactPointOnB: THREE.Vector3, contactImpulse : THREE.Vector3) =>
    {
      for (let listener of this.listeners["collision"])
      {
        if (listener.body.body.id == a.id)
        {
          let bBody = this.scene.getBodyById(b.id);
          if (bBody)
          {
            listener.onCollision(bBody, contactPointOnA, dummyVector3.copy(contactImpulse));
          }
        }
        else if (listener.body.body.id == b.id)
        {
          let aBody = this.scene.getBodyById(b.id);
          if (aBody)
          {
            listener.onCollision(aBody, contactPointOnB, dummyVector3.copy(contactImpulse).multiplyScalar(-1));
          }
        }
      }
    }
  })();

  // ButtonHandler

  onButtonPress(button: string)
  {
    for (let listener of this.listeners["button"])
    {
      listener.onButtonPress(button);
    }
  }

  onButtonHold(button: string)
  {
    for (let listener of this.listeners["button"])
    {
      listener.onButtonHold(button);
    }
  }

  onButtonRelease(button: string)
  {
    for (let listener of this.listeners["button"])
    {
      listener.onButtonRelease(button);
    }
  }

  // DragGestureHandler

  onDragStart(dx: number, dy: number)
  {
    for (let listener of this.listeners["drag"])
    {
      listener.onDragStart(dx, dy);
    }
  }

  onDrag(dx: number, dy: number)
  {
    for (let listener of this.listeners["drag"])
    {
      listener.onDrag(dx, dy);
    }
  }

  onDragRelease(dx: number, dy: number)
  {
    for (let listener of this.listeners["drag"])
    {
      listener.onDragRelease(dx, dy);
    }
  }

  // TapGestureHandler

  onTap()
  {
    // working under the model that interaction events override tap events.
    // if we change to a button-based interaction model, this will need to be reworked

    let didInteract = false;
    if (this.scene.memory.player)
    {
      didInteract = this.onInteract(this.scene.memory.player);
    }

    if (!didInteract)
    {
      for (let listener of this.listeners["tap"])
      {
        listener.onTap();
      }
    }

  }

  // SwipeGestureHandler

  onSwipe(dx: number, dy: number)
  {
    for (let listener of this.listeners["swipe"])
    {
      listener.onSwipe(dx, dy);
    }
  }

  // HoldGestureHandler

  onHoldStart()
  {
    for (let listener of this.listeners["hold"])
    {
      listener.onHoldStart();
    }
  }

  onHoldRelease()
  {
    for (let listener of this.listeners["hold"])
    {
      listener.onHoldRelease();
    }
  }

  // AimGestureHandler

  onAimStart()
  {
    for (let listener of this.listeners["aim"])
    {
      listener.onAimStart();
    }
  }

  onAim(dx: number, dy: number)
  {
    for (let listener of this.listeners["aim"])
    {
      listener.onAim(dx, dy);
    }
  }

  onAimRelease(dx: number, dy: number)
  {
    for (let listener of this.listeners["aim"])
    {
      listener.onAimRelease(dx, dy);
    }
  }

  // InteractHandler

  // TBD: determine how to assign interactors to interactables such that the highest priority one in range is chosen

  onInteract(interactor : BodyHandle)
  {
    for (let listener of this.listeners["interact"])
    {
      if (listener.isInInteractionRange(interactor))
      {
        let didInteract = listener.onInteract(interactor);

        if (didInteract)
        {
          return didInteract;
        }
      }
    }

    return false;
  }

  // ActorDestructionHandler

  onActorDestroyed(actor : BodyHandle)
  {
    for (let listener of this.listeners["actorDestroyed"])
    {
      listener.onActorDestroyed(actor);
    }
  }

  // HitPointChangeHandler

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number)
  {
    for (let listener of this.listeners["hitPointsChanged"])
    {
      listener.onHitPointChange(source, previousHP, currentHP);
    }
  }
}