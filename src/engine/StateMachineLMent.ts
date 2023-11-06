import { BodyHandle } from "./BodyHandle";
import { GameplayScene } from "./GameplayScene";
import { LMent } from "./LMent";
import {
  GenericHandler,
  UpdateHandler,
  CollisionHandler,
  ButtonHandler,
  DragGestureHandler,
  TapGestureHandler,
  SwipeGestureHandler,
  HoldGestureHandler,
  AimGetstureHandler,
  InteractHandler,
  ActorDestructionHandler,
  HitPointChangeHandler,
  TriggerHandler,
  CollisionInfo
} from "./MessageHandlers";

export abstract class State implements 
  Partial<UpdateHandler>,
  Partial<CollisionHandler>,
  Partial<ButtonHandler>,
  Partial<DragGestureHandler>,
  Partial<TapGestureHandler>,
  Partial<SwipeGestureHandler>,
  Partial<HoldGestureHandler>,
  Partial<AimGetstureHandler>,
  Partial<InteractHandler>,
  Partial<ActorDestructionHandler>,
  Partial<HitPointChangeHandler>,
  Partial<TriggerHandler>
{
  name: string;
  stateMachine: StateMachineLMent;

  constructor(name: string, stateMachine: StateMachineLMent)
  {
    this.name = name;
    this.stateMachine = stateMachine;
  }

  abstract onEnterState(previousState : State | undefined) : void;
  abstract onExitState(nextState: State | undefined) : void;

  onUpdate?(dt? : number) : void;

  onCollision?(info: CollisionInfo): void;
  
  onButtonHold?(button: string): void;
  onButtonPress?(button: string): void;
  onButtonRelease?(button: string): void;
  
  onDrag?(dx: number, dy: number): void;
  
  onTap?(): void;
  
  onSwipe?(dx: number, dy: number): void;
  
  onHoldStart?(): void;
  onHoldRelease?(): void;
  
  onAimStart?(): void;
  onAim?(dx: number, dy: number): void;
  onAimRelease?(dx: number, dy: number): void;

  interactionNameOrIcon? : string;
  interactionPriority? : number;

  isInInteractionRange?(interactor : BodyHandle) : boolean;
  onInteract?(interactor: BodyHandle): boolean;

  onActorDestroyed?(actor: BodyHandle): void;

  onHitPointChange?(source: BodyHandle, previousHP: number, currentHP: number) : void;

  onTrigger?(source: LMent, triggerId: string) : void;

  hasSubtype?(subtype: string): boolean;
}

export abstract class StateMachineLMent extends LMent implements
  UpdateHandler,
  CollisionHandler,
  ButtonHandler,
  DragGestureHandler,
  TapGestureHandler,
  SwipeGestureHandler,
  HoldGestureHandler,
  AimGetstureHandler,
  InteractHandler,
  ActorDestructionHandler,
  HitPointChangeHandler,
  TriggerHandler
{
  states: {[key: string]: State | undefined};
  currentState: State | undefined;
  switchStateQueue: (State | undefined)[];

  constructor(body: BodyHandle, id: number, params: Partial<StateMachineLMent> = {})
  {
    super(body, id, params);
    this.states = {};
    this.switchStateQueue = [];
  }

  // responsible for calling switchState to the initial state
  abstract onInit(): void;

  abstract onStart(): void;

  switchState(stateName: string)
  {
    let nextState = this.states[stateName];
    this.switchStateQueue.push(nextState);
    let length = this.switchStateQueue.length;
 
    // onEnterState and onExitState could call switchState, so we need to process the queue in order of switchState calls
    if (length == 1)
    {
      let switchCount = 0;
      while (this.switchStateQueue.length > 0)
      {
        let next = this.switchStateQueue[0];
        let current = this.currentState;
        if (current)
        {
          current.onExitState(next);
          this.removeListeners(current);
        }
        if (next)
        {
          this.currentState = next;
          next.onEnterState(current);
          this.addListeners(next);
        }
        this.switchStateQueue.shift();
        switchCount++;

        if (switchCount > 200)
        {
          throw "StateMachineElement.switchState: infinite loop detected";
        }
      }
    }
  }

  getState(stateName: string) : State | undefined
  {
    return this.states[stateName];
  }

  removeListeners(state : State)
  {
    let dispatcher = GameplayScene.instance.dispatcher;
    
    if (state.onUpdate)
    {
      dispatcher.removeListener("update", this);
    }

    if (state.onCollision)
    {
      dispatcher.removeListener("collision", this);
    }

    if (state.onButtonHold || state.onButtonPress || state.onButtonRelease)
    {
      dispatcher.removeListener("button", this);
    }

    if (state.onDrag)
    {
      dispatcher.removeListener("drag", this);
    }

    if (state.onTap)
    {
      dispatcher.removeListener("tap", this);
    }

    if (state.onSwipe)
    {
      dispatcher.removeListener("swipe", this);
    }

    if (state.onHoldStart || state.onHoldRelease)
    {
      dispatcher.removeListener("hold", this);
    }

    if (state.onAimStart || state.onAim || state.onAimRelease)
    {
      dispatcher.removeListener("aim", this);
    }

    if (state.onInteract)
    {
      dispatcher.removeListener("interact", this);
    }

    if (state.onActorDestroyed)
    {
      dispatcher.removeListener("actorDestroyed", this);
    }

    if (state.onHitPointChange)
    {
      dispatcher.removeListener("hitPointsChanged", this);
    }

    if (state.onTrigger)
    {
      dispatcher.removeListener("trigger", this);
    }
  }

  addListeners(state : State)
  {
    let dispatcher = GameplayScene.instance.dispatcher;
    
    if (state.onUpdate)
    {
      dispatcher.addListener("update", this);
    }

    if (state.onCollision)
    {
      dispatcher.addListener("collision", this);
    }

    if (state.onButtonHold || state.onButtonPress || state.onButtonRelease)
    {
      dispatcher.addListener("button", this);
    }

    if (state.onDrag)
    {
      dispatcher.addListener("drag", this);
    }

    if (state.onTap)
    {
      dispatcher.addListener("tap", this);
    }

    if (state.onSwipe)
    {
      dispatcher.addListener("swipe", this);
    }

    if (state.onHoldStart || state.onHoldRelease)
    {
      dispatcher.addListener("hold", this);
    }

    if (state.onAimStart || state.onAim || state.onAimRelease)
    {
      dispatcher.addListener("aim", this);
    }

    if (state.onInteract)
    {
      dispatcher.addListener("interact", this);
    }

    if (state.onActorDestroyed)
    {
      dispatcher.addListener("actorDestroyed", this);
    }

    if (state.onHitPointChange)
    {
      dispatcher.addListener("hitPointsChanged", this);
    }

    if (state.onTrigger)
    {
      dispatcher.addListener("trigger", this);
    }
  }

  onUpdate(dt: number) : void
  {
    if (this.currentState?.onUpdate)
    {
      this.currentState.onUpdate(dt);
    }
  }

  onCollision(info: CollisionInfo): void
  {
    if (this.currentState?.onCollision)
    {
      this.currentState.onCollision(info);
    }
  }

  onButtonHold(button: string): void
  {
    if (this.currentState?.onButtonHold)
    {
      this.currentState.onButtonHold(button);
    }
  }

  onButtonPress(button: string): void
  {
    if (this.currentState?.onButtonPress)
    {
      this.currentState.onButtonPress(button);
    }
  }
  onButtonRelease(button: string): void
  {
    if (this.currentState?.onButtonRelease)
    {
      this.currentState.onButtonRelease(button);
    }
  }

  onDrag(dx: number, dy: number): void
  {
    if (this.currentState?.onDrag)
    {
      this.currentState.onDrag(dx, dy);
    }
  }
  onTap(): void
  {
    if (this.currentState?.onTap)
    {
      this.currentState.onTap();
    }
  }

  onSwipe(dx: number, dy: number): void
  {
    if (this.currentState?.onSwipe)
    {
      this.currentState.onSwipe(dx, dy);
    }
  }

  onHoldStart(): void
  {
    if (this.currentState?.onHoldStart)
    {
      this.currentState.onHoldStart();
    }
  }

  onHoldRelease(): void
  {
    if (this.currentState?.onHoldRelease)
    {
      this.currentState.onHoldRelease();
    }
  }

  onAimStart(): void
  {
    if (this.currentState?.onAimStart)
    {
      this.currentState.onAimStart();
    }
  }

  onAim(dx: number, dy: number): void
  {
    if (this.currentState?.onAim)
    {
      this.currentState.onAim(dx, dy);
    }
  }

  onAimRelease(dx: number, dy: number): void
  {
    if (this.currentState?.onAimRelease)
    {
      this.currentState.onAimRelease(dx, dy);
    }
  }

  get interactionNameOrIcon() : string
  {
    return this.currentState?.interactionNameOrIcon ?? "";
  }

  get interactionPriority() : number
  {
    return this.currentState?.interactionPriority ?? 0;
  }

  isInInteractionRange(interactor : BodyHandle) : boolean
  {
    if (this.currentState?.isInInteractionRange)
    {
      return this.currentState.isInInteractionRange(interactor);
    }
    return false;
  }

  onInteract(interactor: BodyHandle): boolean
  {
    if (this.currentState?.onInteract)
    {
      return this.currentState.onInteract(interactor);
    }
    return false;
  }

  onActorDestroyed(actor: BodyHandle): void
  {
    if (this.currentState?.onActorDestroyed)
    {
      this.currentState.onActorDestroyed(actor);
    }
  }

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number) : void
  {
    if (this.currentState?.onHitPointChange)
    {
      this.currentState.onHitPointChange(source, previousHP, currentHP);
    }
  }

  onTrigger(source: LMent, triggerId: string) : void
  {
    if (this.currentState?.onTrigger)
    {
      this.currentState.onTrigger(source, triggerId);
    }
  }

  hasSubtype(subtype: string): boolean
  {
    if (this.currentState?.hasSubtype && this.currentState.hasSubtype(subtype))
    {
      return true;
    }
    return false;
  }
}