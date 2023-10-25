
import { js_new, global } from "js";
import {
  CollisionInfoFactory,
  HandlerTypeMap,
  HandlerTypes
} from "./MessageHandlers";
import { LMent } from "./LMent";
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

export type DelayedFunction <T extends (...args: any[]) => any> = {
  element: LMent | undefined,
  func: T,
  delay: number,
  args: Parameters<T>
}

export class MessageDispatcher
{
  scene: GameplayScene;
  listeners : ListenerDict = MakeListenerDict();
  functionQueue : DelayedFunction<any>[] = [];

  constructor(scene: GameplayScene)
  {
    this.scene = scene;
  }

  clearListeners()
  {
    this.listeners = MakeListenerDict();
    this.functionQueue = [];
  }

  removeAllListenersFromBody(body: BodyHandle)
  {
    for (let elem of body.elements)
    {
      this.removeAllListenersFromElement(elem);
    }
  }
  
  removeAllListenersFromElement(elem : LMent)
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
    for (let i = 0; i < this.functionQueue.length; i++)
    {
      if (this.functionQueue[i].element === elem)
      {
        this.functionQueue.splice(i, 1);
        i--;
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

  hasListenerOfType<T extends keyof HandlerTypeMap>(type: T, subtype? : string) : boolean
  {
    if (this.listeners[type] === undefined)
    {
      return false;
    }

    if (subtype !== undefined)
    {
      for (let listener of this.listeners[type])
      {
        if (listener.hasSubtype !== undefined && listener.hasSubtype(subtype))
        {
          return true;
        }
      }
      return false;
    }
    else
    {
      return (this.listeners[type] as unknown[]).length > 0;
    }
  }

  queueDelayedFunction<T extends (...args: any[]) => any> (element: LMent | undefined, func: T, delay: number, ...args: Parameters<T>) : DelayedFunction<T>
  {
    let fq = {
      element: element,
      func: func,
      delay: delay,
      args: args
    }
    this.functionQueue.push(fq);
    return fq;
  }

  removeQueuedFunction(fq: DelayedFunction<any>)
  {
    let index = this.functionQueue.indexOf(fq);
    if (index >= 0)
    {
      this.functionQueue.splice(index, 1);
    }
  }

  updateFunctionQueue(dt: number)
  {
    let funcsToCall: DelayedFunction<any>[] = [];
    for (let i = 0; i < this.functionQueue.length; i++)
    {
      let fq = this.functionQueue[i];
      fq.delay -= dt;
      if (fq.delay <= 0)
      {
        funcsToCall.push(fq);
        this.functionQueue.splice(i, 1);
        i--;
      }
    }

    for (let fq of funcsToCall)
    {
      fq.func(...fq.args);
    }
  }

  // UpdateHandler

  onUpdate()
  {
    // iterate over copy of listeners in case onUpdate adds/removes listeners
    for (let listener of this.listeners["update"].slice())
    {
      listener.onUpdate();
    }
  }

  // CollisionHandler

  onCollision (infoFactory: CollisionInfoFactory)
  {
    // iterate over copy of listeners in case onCollision adds/removes listeners
    for (let listener of this.listeners["collision"].slice())
    {
      if (infoFactory.aId !== undefined && listener.body.body.id == infoFactory.aId)
      {
        listener.onCollision(infoFactory.makeCollisionInfo("a"));
      }
      else if (infoFactory.bId !== undefined && listener.body.body.id == infoFactory.bId)
      {
        listener.onCollision(infoFactory.makeCollisionInfo("b"));
      }
    }
  }

  // ButtonHandler

  onButtonPress(button: string)
  {
    // iterate over copy of listeners in case onButtonPress adds/removes listeners
    for (let listener of this.listeners["button"].slice())
    {
      listener.onButtonPress(button);
    }
  }

  onButtonHold(button: string)
  {
    // iterate over copy of listeners in case onButtonHold adds/removes listeners
    for (let listener of this.listeners["button"].slice())
    {
      listener.onButtonHold(button);
    }
  }

  onButtonRelease(button: string)
  {
    // iterate over copy of listeners in case onButtonRelease adds/removes listeners
    for (let listener of this.listeners["button"].slice())
    {
      listener.onButtonRelease(button);
    }
  }

  // DragGestureHandler

  onDrag(dx: number, dy: number)
  {
    for (let listener of this.listeners["drag"])
    {
      listener.onDrag(dx, dy);
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
      // iterate over copy of listeners in case onTap adds/removes listeners
      for (let listener of this.listeners["tap"].slice())
      {
        listener.onTap();
      }
    }
  }

  // SwipeGestureHandler

  onSwipe(dx: number, dy: number)
  {
    for (let listener of this.listeners["swipe"].slice())
    {
      listener.onSwipe(dx, dy);
    }
  }

  // HoldGestureHandler

  onHoldStart()
  {
    for (let listener of this.listeners["hold"].slice())
    {
      listener.onHoldStart();
    }
  }

  onHoldRelease()
  {
    for (let listener of this.listeners["hold"].slice())
    {
      listener.onHoldRelease();
    }
  }

  // AimGestureHandler

  onAimStart()
  {
    for (let listener of this.listeners["aim"].slice())
    {
      listener.onAimStart();
    }
  }

  onAim(dx: number, dy: number)
  {
    for (let listener of this.listeners["aim"].slice())
    {
      listener.onAim(dx, dy);
    }
  }

  onAimRelease(dx: number, dy: number)
  {
    for (let listener of this.listeners["aim"].slice())
    {
      listener.onAimRelease(dx, dy);
    }
  }

  // InteractHandler

  // TBD: determine how to assign interactors to interactables such that the highest priority one in range is chosen

  onInteract(interactor : BodyHandle)
  {
    for (let listener of this.listeners["interact"].slice())
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
    for (let listener of this.listeners["actorDestroyed"].slice())
    {
      listener.onActorDestroyed(actor);
    }
  }

  // HitPointChangeHandler

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number)
  {
    for (let listener of this.listeners["hitPointsChanged"].slice())
    {
      listener.onHitPointChange(source, previousHP, currentHP);
    }
  }
}