import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { js_new, global } from "js";
import { Vector3 } from "three";

export class PingPongMotion extends LMent implements UpdateHandler
{
    //PARAMS:
    speed:number;
    axis:string;
    halfWay: number;
    origin: string; //should be either center or edge.

    //Local Variables
    private initPos: THREE.Vector3;
    private vectorAxis: THREE.Vector3;

    constructor(body: BodyHandle, id: number, params: Partial<PingPongMotion> = {})
    {
      super(body, id);
      this.speed = params.speed === undefined?10:params.speed;
      this.axis = params.axis === undefined?"Z":params.axis;
      this.halfWay = params.halfWay === undefined?1:params.halfWay;
      this.origin = params.origin === undefined?"initial":params.origin;

      this.initPos = body.body.getPosition().clone();
      this.vectorAxis = this.initAxis().clone();
    }
  
    onInit(): void {
      GameplayScene.instance.dispatcher.addListener("update", this);
    }
  
    onStart(): void {
      
    }

    onUpdate():void{
        let time = GameplayScene.instance.memory.timeSinceStart;
        let distance = Math.sin(time*this.speed)*this.halfWay;
        
        let newPos = this.vectorAxis.clone().multiplyScalar(distance);

        if(this.origin.toString().toLowerCase() == "edge")
          newPos.add(this.vectorAxis.clone().multiplyScalar(this.halfWay));

        this.body.body.setPosition(newPos.add(this.initPos));
    }

    initAxis(): THREE.Vector3
    {
      let myAxis = js_new(global.THREE.Vector3,1,0,0);
      if(this.axis.toString().toLowerCase() == "y")
        myAxis.set(0,1,0);
      else if(this.axis.toString().toLowerCase() == "z")
      myAxis.set(0,0,1);
      return myAxis;
    }
}