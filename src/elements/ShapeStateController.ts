import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { ShapeStateAnimator } from "./ShapeStateAnimator";

export class ShapeStateController extends LMent
{
    private animStates:ShapeStateAnimator[] = [];
    private activeStateName:string = "";
    constructor(body: BodyHandle, id: number, params: Partial<ShapeStateController> = {})
    {
      super(body, id,params);
    }
  
    onInit(): void {
    }
  
    onStart(): void {
      if(this.animStates.length>0)
         if(this.animStates[0] !== undefined)
           {
            this.animStates[0].startState();
            this.activeStateName = this.animStates[0].stateName;
           }
    }

    addState(state:ShapeStateAnimator)
    {
      this.animStates.push(state);
    }

    playState(name:string)
    {
      if(name == this.activeStateName)
        return;

      let stateFound = false;
      for(let state of this.animStates) 
        if(state.stateName === name)
          {
            this.activeStateName = name;
            state.startState();
            stateFound = true;
          }
        else state.stopState();

      if(!stateFound)
          console.error("Animation state of name ("+name+") is not found.");
    }
}