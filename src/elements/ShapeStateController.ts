import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { ShapeStateAnimator } from "./ShapeStateAnimator";
import { GameplayScene } from "engine/GameplayScene";

export class ShapeStateController extends LMent
{
    private animStates:ShapeStateAnimator[] = [];
    private activeState:ShapeStateAnimator = {} as ShapeStateAnimator;
    private deltaTime = 1/GameplayScene.instance.memory.frameRate;
    constructor(body: BodyHandle, id: number, params: Partial<ShapeStateController> = {})
    {
      super(body, id,params);
    }
  
    onInit(): void {
    }
  
    onStart(): void {
      this.playStateZero();
    }

    playStateZero(){
      GameplayScene.instance.dispatcher.queueDelayedFunction(this,()=>{
        if(this.animStates.length>0)
         if(this.animStates[0] !== undefined)
           {
            this.animStates[0].startState();
            this.activeState = this.animStates[0];
           }
      },this.deltaTime);
    }

    addState(state:ShapeStateAnimator)
    {
      this.animStates.push(state);
    }

    playState(name:string)
    {
      if(name == this.activeState.stateName)
        return;

      let stateFound = false;
      for(let state of this.animStates) 
        if(state.stateName === name)
        {
          this.activeState.stopState();
          state.startState();
          this.activeState = state;
          stateFound = true;
        }

      if(!stateFound)
          console.error("Animation state of name ("+name+") is not found.");
    }
}