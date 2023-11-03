import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { js_new, global } from "js";

export class RotateMotion extends LMent implements UpdateHandler
{
    //PARAMS:
    speed:number;
    axis:string;
    radius: number;

    //Local Variables
    private initPos: THREE.Vector3;
    private rotateAxis: THREE.Vector3;

    constructor(body: BodyHandle, id: number, params: Partial<RotateMotion> = {})
    {
      super(body, id,params);
      this.speed = params.speed === undefined?10:params.speed;
      this.axis = params.axis === undefined?"z":params.axis;
      this.radius = params.radius === undefined?0:params.radius;

      this.initPos = body.body.getPosition().clone();
      this.rotateAxis = this.initRotationAxis().clone();
    }
  
    onInit(): void {
      GameplayScene.instance.dispatcher.addListener("update", this);
    }
  
    onStart(): void {
      
    }

    onUpdate():void{
      if(this.radius > 0)
        this.runMotion();
      this.runRotation();
    }

    initRotationAxis(): THREE.Vector3
    {
      let myAxis = js_new(global.THREE.Vector3,1,0,0);
      if(this.axis.toString().toLowerCase() == "y")
        myAxis.set(0,1,0);
      else if(this.axis.toString().toLowerCase() == "z")
        myAxis.set(0,0,1);
      return myAxis;
    }

    runMotion()
    {

      let time = GameplayScene.instance.memory.timeSinceStart;
      let sinVal = Math.sin(time*this.speed)*this.radius;
      let cosVal = Math.cos(time*this.speed)*this.radius;
      
      let newPos = js_new(global.THREE.Vector3,sinVal,0,cosVal);
      if(this.axis.toString().toLowerCase() == "x")
        newPos.set(0,sinVal,cosVal);
      else if(this.axis.toString().toLowerCase() == "z")
        newPos.set(sinVal,cosVal,0);

      this.body.body.setPosition(newPos.add(this.initPos));
    }

    runRotation()
    {
      let quat = js_new(global.THREE.Quaternion);
      let timeElapsed = GameplayScene.instance.memory.timeSinceStart;
      quat.setFromAxisAngle(this.rotateAxis,this.speed*timeElapsed);
      this.body.body.setRotation(quat);
    }
}