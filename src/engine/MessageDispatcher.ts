
import {
  CollisionHandler,
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
  collisionListenersByBody : {[key: number]: ListenerType<"collision">[]} = {};
  functionQueue : DelayedFunction<any>[] = [];

  constructor(scene: GameplayScene)
  {
    this.scene = scene;
  }

  clearListeners()
  {
    this.listeners = MakeListenerDict();
    this.functionQueue = [];
    this.collisionListenersByBody = {};
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
    for (let bodyId in this.collisionListenersByBody)
    {
      let listeners = this.collisionListenersByBody[bodyId];
      for (let i = 0; i < listeners.length; i++)
      {
        if (listeners[i] === elem)
        {
          listeners.splice(i, 1);
          i--;
        }
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

    if (type == "collision")
    {
      let listeners = this.collisionListenersByBody[listener.body.body.id];
      let index = listeners.indexOf(listener as ListenerType<"collision">);
      if (index >= 0)
      {
        listeners.splice(index, 1);
      }
    }
  }

  addListener<T extends keyof HandlerTypeMap>(type: T, listener: ListenerType<T>)
  {
    this.listeners[type].push(listener);

    if (type == "collision")
    {
      if (this.collisionListenersByBody[listener.body.body.id] === undefined)
      {
        this.collisionListenersByBody[listener.body.body.id] = [];
      }
      this.collisionListenersByBody[listener.body.body.id].push(listener as ListenerType<"collision">);
    }
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

    for (let i = 0; i < funcsToCall.length; i++)
    {
      let fq = funcsToCall[i];
      fq.func(...fq.args);
    }
  }

  // UpdateHandler

  onUpdate(dt: number)
  {
    // iterate over copy of listeners in case onUpdate adds/removes listeners
    let listeners = this.listeners["update"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onUpdate(dt);
      }
    }
  }

  // PhysicSubstepHandler
  onPhysicsSubstep(dt: number)
  {
    // iterate over copy of listeners in case onPhysicsSubstep adds/removes listeners
    let listeners = this.listeners["physicsSubstep"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onPhysicsSubstep(dt);
      }
    }
  }

  // CollisionHandler

  onCollision (infoFactory: CollisionInfoFactory)
  {
    let listenersA = this.collisionListenersByBody[infoFactory.aId];
    if (listenersA !== undefined)
    {
      for (let i = 0; i < listenersA.length; i++)
      {
        let listener = listenersA[i];
        if (listener.enabled) {
          listener.onCollision(infoFactory.makeCollisionInfo("a"));
        }
      }
    }
    let listenersB = this.collisionListenersByBody[infoFactory.bId];
    if (listenersB !== undefined)
    {
      for (let i = 0; i < listenersB.length; i++)
      {
        let listener = listenersB[i];
        if (listener.enabled) {
          listener.onCollision(infoFactory.makeCollisionInfo("b"));
        }
      }
    }

    if(this.scene.modscriptManager)
      this.scene.modscriptManager.onCollision(infoFactory);
  }

  // ButtonHandler

  onButtonPress(button: string)
  {
    // iterate over copy of listeners in case onButtonPress adds/removes listeners
    let listeners = this.listeners["button"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onButtonPress(button);
      }
    }
  }

  onButtonHold(button: string)
  {
    // iterate over copy of listeners in case onButtonHold adds/removes listeners
    let listeners = this.listeners["button"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onButtonHold(button);
      }
    }
  }

  onButtonRelease(button: string)
  {
    // iterate over copy of listeners in case onButtonRelease adds/removes listeners
    let listeners = this.listeners["button"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onButtonRelease(button);
      }
    }
  }

  // DragGestureHandler

  onDrag(dx: number, dy: number)
  {
    let listeners = this.listeners["drag"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
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
    let listeners = this.listeners["tap"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
        if (listener.enabled) {
          listener.onTap();
        }
      }
    }
  }

  // SwipeGestureHandler

  onSwipe(dx: number, dy: number)
  {
    let listeners = this.listeners["swipe"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onSwipe(dx, dy);
      }
    }
  }

  // HoldGestureHandler

  onHoldStart()
  {
    let listeners = this.listeners["hold"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onHoldStart();
      }
    }
  }

  onHoldRelease()
  {
    let listeners = this.listeners["hold"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onHoldRelease();
      }
    }
  }

  // AimGestureHandler

  onAimStart()
  {
    let listeners = this.listeners["aim"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onAimStart();
      }
    }
  }

  onAim(dx: number, dy: number)
  {
    let listeners = this.listeners["aim"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onAim(dx, dy);
      }
    }
  }

  onAimRelease(dx: number, dy: number)
  {
    let listeners = this.listeners["aim"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onAimRelease(dx, dy);
      }
    }
  }

  // InteractHandler

  onInteract(interactor : BodyHandle)
  {
    let listeners = this.listeners["interact"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
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

  getInteractables()
  {
    return this.listeners["interact"].filter((listener) => listener.enabled);
  }

  // ActorDestructionHandler

  onActorDestroyed(actor : BodyHandle)
  {
    let listeners = this.listeners["actorDestroyed"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
      if (listener.enabled) {
        listener.onActorDestroyed(actor);
      }
    }
  }

  // HitPointChangeHandler

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number)
  {
    let listeners = this.listeners["hitPointsChanged"].slice();
    for (let i = 0; i < listeners.length; i++)
    {
      let listener = listeners[i];
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
      let listeners = this.listeners["trigger"].slice();
      for (let i = 0; i < listeners.length; i++)
      {
        let listener = listeners[i];
        if ((listener.enabled || listener.receivesTriggersWhenDisabled) && listener.body == body && listener.hasSubtype(triggerId)) {
          listener.onTrigger(source, triggerId);
        }
      }
    }
    else if (context == "group")
    {
      let listeners = this.listeners["trigger"].slice();
      for (let i = 0; i < listeners.length; i++)
      {
        let listener = listeners[i];
        if ((listener.enabled || listener.receivesTriggersWhenDisabled) && listener.hasSubtype(triggerId)) {
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
      let listeners = this.listeners["trigger"].slice();
      for (let i = 0; i < listeners.length; i++)
      {
        let listener = listeners[i];
        if ((listener.enabled || listener.receivesTriggersWhenDisabled) && listener.hasSubtype(triggerId)) {
          listener.onTrigger(source, triggerId);
        }
      }  
    }
  }
}