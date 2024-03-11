import { BodyHandle, ShapePointer } from "./BodyHandle";
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
  CollisionInfo,
  HandlerTypeMap
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

export abstract class AnimatedState extends State implements UpdateHandler
{
  animName: string;
  animBlendTime: number;
  shape: ShapePointer | undefined;

  constructor(name: string, stateMachine: StateMachineLMent, shapeToAnimate: ShapePointer | undefined, animName: string, animBlendTime: number)
  {
    super(name, stateMachine);
    this.shape = shapeToAnimate;

    //By default, use the first shape
    if(this.shape === undefined)
      this.shape = this.stateMachine.body.body.getShapes()[0];

    this.animName = animName;
    this.animBlendTime = animBlendTime;
  }

  onEnterState(previousState: State | undefined): void {
    this.playShapeAnimation();
  }

  playShapeAnimation() {
    if (this.shape && this.animName !== "custom")
        this.shape.playAnimation(this.animName, this.animBlendTime);
  }

  onUpdate(dt?: number | undefined): void {
    if(this.animName === "custom")
      this.playCustomAnimation(dt);
  }

  protected playCustomAnimation(dt: number | undefined) {
    /* Override by children */
  }
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
  alwaysOnListeners: Set<keyof HandlerTypeMap>;

  constructor(body: BodyHandle, id: number, params: Partial<StateMachineLMent> = {})
  {
    super(body, id, params);
    this.states = {};
    this.switchStateQueue = [];
    this.alwaysOnListeners = new Set<keyof HandlerTypeMap>();
  }

  // responsible for calling switchState to the initial state
  abstract onInit(): void;

  abstract onStart(): void;

  switchState(stateName: string)
  {
    let nextState = this.states[stateName];
    if (nextState === undefined)
    {
      console.warn("unknown state", stateName);
      return;
    }

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
    
    if (state.onUpdate && !this.alwaysOnListeners.has("update"))
    {
      dispatcher.removeListener("update", this);
    }

    if (state.onCollision && !this.alwaysOnListeners.has("collision"))
    {
      dispatcher.removeListener("collision", this);
    }

    if ((state.onButtonHold || state.onButtonPress || state.onButtonRelease)  && !this.alwaysOnListeners.has("button"))
    {
      dispatcher.removeListener("button", this);
    }

    if (state.onDrag && !this.alwaysOnListeners.has("drag"))
    {
      dispatcher.removeListener("drag", this);
    }

    if (state.onTap && !this.alwaysOnListeners.has("tap"))
    {
      dispatcher.removeListener("tap", this);
    }

    if (state.onSwipe && !this.alwaysOnListeners.has("swipe"))
    {
      dispatcher.removeListener("swipe", this);
    }

    if ((state.onHoldStart || state.onHoldRelease) && !this.alwaysOnListeners.has("hold"))
    {
      dispatcher.removeListener("hold", this);
    }

    if ((state.onAimStart || state.onAim || state.onAimRelease) && !this.alwaysOnListeners.has("aim"))
    {
      dispatcher.removeListener("aim", this);
    }

    if (state.onInteract && !this.alwaysOnListeners.has("interact"))
    {
      dispatcher.removeListener("interact", this);
    }

    if (state.onActorDestroyed && !this.alwaysOnListeners.has("actorDestroyed"))
    {
      dispatcher.removeListener("actorDestroyed", this);
    }

    if (state.onHitPointChange && !this.alwaysOnListeners.has("hitPointsChanged"))
    {
      dispatcher.removeListener("hitPointsChanged", this);
    }

    if (state.onTrigger && !this.alwaysOnListeners.has("trigger"))
    {
      dispatcher.removeListener("trigger", this);
    }
  }

  addListeners(state : State)
  {
    let dispatcher = GameplayScene.instance.dispatcher;
    
    if (state.onUpdate && !this.alwaysOnListeners.has("update"))
    {
      dispatcher.addListener("update", this);
    }

    if (state.onCollision && !this.alwaysOnListeners.has("collision"))
    {
      dispatcher.addListener("collision", this);
    }

    if ((state.onButtonHold || state.onButtonPress || state.onButtonRelease)  && !this.alwaysOnListeners.has("button"))
    {
      dispatcher.addListener("button", this);
    }

    if (state.onDrag && !this.alwaysOnListeners.has("drag"))
    {
      dispatcher.addListener("drag", this);
    }

    if (state.onTap && !this.alwaysOnListeners.has("tap"))
    {
      dispatcher.addListener("tap", this);
    }

    if (state.onSwipe && !this.alwaysOnListeners.has("swipe"))
    {
      dispatcher.addListener("swipe", this);
    }

    if ((state.onHoldStart || state.onHoldRelease) && !this.alwaysOnListeners.has("hold"))
    {
      dispatcher.addListener("hold", this);
    }

    if ((state.onAimStart || state.onAim || state.onAimRelease) && !this.alwaysOnListeners.has("aim"))
    {
      dispatcher.addListener("aim", this);
    }

    if (state.onInteract && !this.alwaysOnListeners.has("interact"))
    {
      dispatcher.addListener("interact", this);
    }

    if (state.onActorDestroyed && !this.alwaysOnListeners.has("actorDestroyed"))
    {
      dispatcher.addListener("actorDestroyed", this);
    }

    if (state.onHitPointChange && !this.alwaysOnListeners.has("hitPointsChanged"))
    {
      dispatcher.removeListener("hitPointsChanged", this);
    }

    if (state.onTrigger && !this.alwaysOnListeners.has("trigger"))
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