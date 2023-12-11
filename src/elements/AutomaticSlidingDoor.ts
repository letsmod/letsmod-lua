import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { Vector3 } from "three";
import { Helpers } from "engine/Helpers";

class ClosedState extends State implements TriggerHandler {
  triggerId: string | undefined;

  constructor(stateMachine: StateMachineLMent, triggerId: string | undefined) {
    super("closed", stateMachine);
    this.triggerId = triggerId;
  }

  onEnterState(previousState: State | undefined) {
    // console.log("ClosedState.onEnter");
  }

  onExitState(nextState: State | undefined) {
    // console.log("ClosedState.onExit");
  }

  onTrigger(source: LMent, triggerId: string): void {
    if (triggerId == this.triggerId) {
      this.stateMachine.switchState("opening");
    }
  }

  hasSubtype(subtype: string): boolean {
    return subtype == this.triggerId;
  }
}

class OpeningState extends State implements UpdateHandler {
  targetPosition: Vector3;
  speed: number;

  constructor(stateMachine: StateMachineLMent, initialPosition: Vector3, targetOffset: Vector3, speed: number) {
    super("opening", stateMachine);
    this.targetPosition = initialPosition.clone().add(targetOffset);
    this.speed = speed;
  }

  onEnterState(previousState: State | undefined) {
    // console.log("OpeningState.onEnter");
  }

  onExitState(nextState: State | undefined) {
    // console.log("OpeningState.onExit");
  }

  onUpdate(dt: number): void {
    let delta = this.targetPosition.clone().sub(this.stateMachine.body.body.getPosition());
    let length = delta.length();
    let speedDt = this.speed * dt;

    if (length < speedDt) {
      this.stateMachine.body.body.setPosition(this.targetPosition);
      this.stateMachine.switchState("open");
    }
    else {
      delta.normalize().multiplyScalar(speedDt);
      this.stateMachine.body.body.offsetPosition(delta);
    }
  }
}

class OpenState extends State implements TriggerHandler, UpdateHandler {
  triggerId: string | undefined;
  stayOpenDuration: number;
  currentOpenDuration: number;

  constructor(stateMachine: StateMachineLMent, triggerId: string | undefined, stayOpenDuration: number) {
    super("open", stateMachine);
    this.triggerId = triggerId;
    this.stayOpenDuration = stayOpenDuration;
    this.currentOpenDuration = 0;
  }

  onEnterState(previousState: State | undefined) {
    this.currentOpenDuration = 0;
    // console.log("OpenState.onEnter");
  }

  onExitState(nextState: State | undefined) {
    // console.log("OpenState.onExit");
  }

  onUpdate(dt: number): void {
    this.currentOpenDuration += dt;

    if (this.currentOpenDuration >= this.stayOpenDuration - 2.2e-16) // epsilon for floating point error
    {
      this.stateMachine.switchState("closing");
    }
  }

  onTrigger(source: LMent, triggerId: string): void {
    if (triggerId == this.triggerId) {
      this.currentOpenDuration = 0;
    }
  }

  hasSubtype(subtype: string): boolean {
    return subtype == this.triggerId;
  }
}

class ClosingState extends State implements UpdateHandler, TriggerHandler {
  triggerId: string | undefined;
  initialPosition: Vector3;
  speed: number;

  constructor(stateMachine: StateMachineLMent, triggerId: string | undefined, initialPosition: Vector3, speed: number) {
    super("closing", stateMachine);
    this.triggerId = triggerId;
    this.initialPosition = initialPosition.clone();
    this.speed = speed;
  }

  onEnterState(previousState: State | undefined) {
    // console.log("ClosingState.onEnter");
  }

  onExitState(nextState: State | undefined) {
    // console.log("ClosingState.onExit");
  }

  onUpdate(dt: number): void {
    let delta = this.initialPosition.clone().sub(this.stateMachine.body.body.getPosition());
    let length = delta.length();
    let speedDt = this.speed * dt;

    if (length < speedDt) {
      this.stateMachine.body.body.setPosition(this.initialPosition);
      this.stateMachine.switchState("closed");
    }
    else {
      delta.normalize().multiplyScalar(speedDt);
      this.stateMachine.body.body.offsetPosition(delta);
    }
  }

  onTrigger(source: LMent, triggerId: string): void {
    if (triggerId == this.triggerId) {
      this.stateMachine.switchState("opening");
    }
  }

  hasSubtype(subtype: string): boolean {
    return subtype == this.triggerId;
  }
}

export class AutomaticSlidingDoor extends StateMachineLMent {
  openOnTrigger: string | undefined;
  openOffset: Vector3;
  openSpeed: number;
  closeSpeed: number;
  stayOpenDuration: number;

  constructor(body: BodyHandle, id: number, params: Partial<AutomaticSlidingDoor> = {}) {
    super(body, id, params);
    this.openOnTrigger = params.openOnTrigger;
    this.openOffset = Helpers.zeroVector;
    if (params.openOffset !== undefined) {
      this.openOffset.copy(params.openOffset);
    }

    this.openSpeed = params.openSpeed === undefined ? 1 : params.openSpeed;
    this.closeSpeed = params.closeSpeed === undefined ? 1 : params.closeSpeed;
    this.stayOpenDuration = params.stayOpenDuration === undefined ? 1 : params.stayOpenDuration;
  }

  onInit() {
    this.openOffset = this.openOffset.applyQuaternion(this.body.body.getRotation());
    this.states = {
      "closed": new ClosedState(this, this.openOnTrigger),
      "opening": new OpeningState(this, this.body.body.getPosition(), this.openOffset, this.openSpeed),
      "open": new OpenState(this, this.openOnTrigger, this.stayOpenDuration),
      "closing": new ClosingState(this, this.openOnTrigger, this.body.body.getPosition(), this.closeSpeed)
    }

    this.switchState("closed");
  }

  onStart() {
  }
}
