import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { ShapeStateAnimator } from "./ShapeStateAnimator";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class ShapeStateController extends LMent {
  name: string;
  private animStates: ShapeStateAnimator[] = [];
  private activeState: ShapeStateAnimator |undefined;

  constructor(body: BodyHandle, id: number, params: Partial<ShapeStateController> = {}) {
    super(body, id, params);
    this.name = params.name === undefined ? "default" : params.name;
  }

  onInit(): void {
  }

  onStart(): void {
    this.playStateZero();
  }

  playStateZero() {
    GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
      if (this.animStates.length > 0)
        if (this.animStates[0] !== undefined) {
          this.animStates[0].startState();
          this.activeState = this.animStates[0];
        }
    }, Helpers.deltaTime);
  }

  addState(state: ShapeStateAnimator) {
    this.animStates.push(state);
  }

  playState(name: string, forcePlay:boolean = false) {
    if(this.activeState === undefined)return;
    if (name == this.activeState.stateName && this.activeState.loop)
      return;

    let stateSearchStatus = 0;
    for (let state of this.animStates)
      if (state.stateName === name) {
        if(!forcePlay && this.activeState.priority > state.priority && !this.activeState.FinishedPlaying)
          {
            stateSearchStatus = 1;
            break;
          }
        this.activeState.stopState();

        state.startState();
        this.activeState = state;
        stateSearchStatus = 2;
      }

    if (stateSearchStatus == 0)
      console.error("Animation state of name (" + name + ") is not found.");
    else if (stateSearchStatus == 1)
      console.error("Can't play state: "+name+" as a higher priority state: "+this.activeState.stateName+" is playing");
  }
}