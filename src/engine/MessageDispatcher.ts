
import { js_new, global } from "js";
import {
  CollisionInfoFactory,
  HandlerTypeMap,
  HandlerTypes
} from "./MessageHandlers";
import { LMent } from "./LMent";
import { BodyHandle } from "./BodyHandle";
import { GameplayScene } from "./GameplayScene";

export type ListenerType<key extends keyof HandlerTypeMap> = LMent & HandlerTypeMap[key];

export type ListenerDict = {
  [key in keyof HandlerTypeMap]: ListenerType<key>[];
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

  removeListener<T extends keyof HandlerTypeMap>(type: T, listener: ListenerType<T>)
  {
    let listeners = this.listeners[type];
    let index = listeners.indexOf(listener);
    if (index >= 0)
    {
      listeners.splice(index, 1);
    }
  }

  addListener<T extends keyof HandlerTypeMap>(type: T, listener: ListenerType<T>)
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

  onUpdate(dt: number)
  {
    // iterate over copy of listeners in case onUpdate adds/removes listeners
    for (let listener of this.listeners["update"].slice())
    {
      if (listener.enabled) {
        listener.onUpdate(dt);
      }
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
        if (listener.enabled) {
          listener.onCollision(infoFactory.makeCollisionInfo("a"));
        }
      }
      else if (infoFactory.bId !== undefined && listener.body.body.id == infoFactory.bId)
      {
        if (listener.enabled) {
          listener.onCollision(infoFactory.makeCollisionInfo("b"));
        }
      }
    }
  }

  // ButtonHandler

  onButtonPress(button: string)
  {
    // iterate over copy of listeners in case onButtonPress adds/removes listeners
    for (let listener of this.listeners["button"].slice())
    {
      if (listener.enabled) {
        listener.onButtonPress(button);
      }
    }
  }

  onButtonHold(button: string)
  {
    // iterate over copy of listeners in case onButtonHold adds/removes listeners
    for (let listener of this.listeners["button"].slice())
    {
      if (listener.enabled) {
        listener.onButtonHold(button);
      }
    }
  }

  onButtonRelease(button: string)
  {
    // iterate over copy of listeners in case onButtonRelease adds/removes listeners
    for (let listener of this.listeners["button"].slice())
    {
      if (listener.enabled) {
        listener.onButtonRelease(button);
      }
    }
  }

  // DragGestureHandler

  onDrag(dx: number, dy: number)
  {
    for (let listener of this.listeners["drag"])
    {
      if (listener.enabled) {
        listener.onDrag(dx, dy);
      }
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
        if (listener.enabled) {
          listener.onTap();
        }
      }
    }
  }

  // SwipeGestureHandler

  onSwipe(dx: number, dy: number)
  {
    for (let listener of this.listeners["swipe"].slice())
    {
      if (listener.enabled) {
        listener.onSwipe(dx, dy);
      }
    }
  }

  // HoldGestureHandler

  onHoldStart()
  {
    for (let listener of this.listeners["hold"].slice())
    {
      if (listener.enabled) {
        listener.onHoldStart();
      }
    }
  }

  onHoldRelease()
  {
    for (let listener of this.listeners["hold"].slice())
    {
      if (listener.enabled) {
        listener.onHoldRelease();
      }
    }
  }

  // AimGestureHandler

  onAimStart()
  {
    for (let listener of this.listeners["aim"].slice())
    {
      if (listener.enabled) {
        listener.onAimStart();
      }
    }
  }

  onAim(dx: number, dy: number)
  {
    for (let listener of this.listeners["aim"].slice())
    {
      if (listener.enabled) {
        listener.onAim(dx, dy);
      }
    }
  }

  onAimRelease(dx: number, dy: number)
  {
    for (let listener of this.listeners["aim"].slice())
    {
      if (listener.enabled) {
        listener.onAimRelease(dx, dy);
      }
    }
  }

  // InteractHandler

  // TBD: determine how to assign interactors to interactables such that the highest priority one in range is chosen

  onInteract(interactor : BodyHandle)
  {
    for (let listener of this.listeners["interact"].slice())
    {
      if (listener.enabled && listener.isInInteractionRange(interactor))
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
      if (listener.enabled) {
        listener.onActorDestroyed(actor);
      }
    }
  }

  // HitPointChangeHandler

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number)
  {
    for (let listener of this.listeners["hitPointsChanged"].slice())
    {
      if (listener.enabled) {
        listener.onHitPointChange(source, previousHP, currentHP);
      }
    }
  }

  // TriggerHandler

  onTrigger(source: LMent, triggerId: string, context: "local" | "group" | "global")
  {
    if (context == "local")
    {
      let body = source.body;
      for (let listener of this.listeners["trigger"].slice())
      {
        if (listener.enabled && listener.body == body && listener.hasSubtype(triggerId)) {
          listener.onTrigger(source, triggerId);
        }
      }
    }
    else if (context == "group")
    {
      for (let listener of this.listeners["trigger"].slice())
      {
        if (listener.enabled && listener.hasSubtype(triggerId)) {
          for (let body of source.body.bodyGroup)
          {
            if (listener.body == body)
            {
              listener.onTrigger(source, triggerId);
            }
          }
        }
      }
    }
    else // context == "global"
    {
      for (let listener of this.listeners["trigger"].slice())
      {
        if (listener.enabled && listener.hasSubtype(triggerId)) {
          listener.onTrigger(source, triggerId);
        }
      }  
    }
  }
}