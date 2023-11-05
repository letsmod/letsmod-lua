import { BodyHandle } from "engine/BodyHandle";
import { GameplayMemory } from "engine/GameplayMemory";
import { GameplayScene } from "engine/GameplayScene";
import { ButtonHandler, CollisionInfo, DragGestureHandler } from "engine/MessageHandlers";
import { global, js_new } from "js";
import { AvatarBase } from "./AvatarBase";
import { ShapeStateController } from "./ShapeStateController";

export class PlatformerAvatar extends AvatarBase implements ButtonHandler, DragGestureHandler
{
  maxSpeed: number; // meters per second
  acceleration: number; // meters per second per second
  deceleration: number; // meters per second per second
  jumpVelo:number;

  private dragDx = 0;
  private dragDy = 0;
  private canRecord = false;
  private deltaTime = 1/GameplayScene.instance.memory.frameRate;
  private isOnGround = false;

  //Don, any other hack for such a thing?
  private anim:ShapeStateController = {} as ShapeStateController;
  constructor(body: BodyHandle, id: number, params: Partial<PlatformerAvatar> = {})
  {
    super(body, id, params);
    this.maxSpeed = params.maxSpeed === undefined? 5 : params.maxSpeed;
    this.acceleration = params.acceleration === undefined? this.maxSpeed * 5 : params.acceleration;
    this.deceleration = params.deceleration === undefined? this.maxSpeed * 5 : params.deceleration;
    this.jumpVelo = params.jumpVelo===undefined?9:params.jumpVelo;
  }

  override onInit(): void {super.onInit();
    
    GameplayScene.instance.dispatcher.addListener("button", this);
    GameplayScene.instance.dispatcher.addListener("drag", this);
    GameplayScene.instance.memory.player = this.body;
    this.body.body.lockRotation(true,false,true);
  }
  override onCollision(info: CollisionInfo): void {super.onCollision(info);
        
      let upVector = js_new(global.THREE.Vector3,0,1,0);
      if(info.getDeltaVSelf().normalize().dot(upVector) >0.7)
        this.isOnGround = true;

      
      this.body.body.setAngularVelocity(js_new(global.THREE.Vector3,0,0,0));
  }

  DEBUG_RecordCollisionInfo(info: CollisionInfo)
  {
    if(!this.canRecord)return;

    this.canRecord = false;
    // console.log("DeltaV Other: ("+info.getDeltaVOther().x+","+info.getDeltaVOther().y+"",info.getDeltaVOther().z+")");
    // console.log("DeltaV Self: ("+info.getDeltaVSelf().x+","+info.getDeltaVSelf().y+"",info.getDeltaVSelf().z+")");
    // console.log("DeltaV Relative: ("+info.getDeltaVRelative().x+","+info.getDeltaVRelative().y+"",info.getDeltaVRelative().z+")");
    // console.log("Other Dot Self: "+info.getDeltaVOther().dot(info.getDeltaVSelf()));
  }

  override onStart(): void {super.onStart();
    let x = this.body.getElement(ShapeStateController);
    if(x !== undefined)
      this.anim = x;
    else console.error("No "+ShapeStateController.name+" is found on this body.");
  }

  override onUpdate(): void {super.onUpdate();
    this.onGroundReset();
    if(!this.isOnGround)
      this.playAnimation("Jump");
    this.Walk();
  }


  onGroundReset(){
    GameplayScene.instance.dispatcher.queueDelayedFunction(this,()=>{
      this.isOnGround = false;
    },this.deltaTime);
  }

  Walk(){
    let velocity = this.body.body.getVelocity();
    let planarVelocity = js_new(global.THREE.Vector3, velocity.x, 0, velocity.z);
    
    let targetX = -this.dragDx * this.maxSpeed;
    let targetZ = -this.dragDy * this.maxSpeed;
    let target = js_new(global.THREE.Vector3, targetX, 0, targetZ);

    let delta = target.sub(planarVelocity);

    let accel : number;

    if (this.dragDx == 0 && this.dragDy == 0)
    {
      accel = this.deceleration / GameplayScene.instance.memory.frameRate;
      if(this.isOnGround)
      this.playAnimation("Idle");
    }
    else
    {
      accel = this.acceleration / GameplayScene.instance.memory.frameRate;
      this.handlePlayerOrientation();
      //Don :: For some reason, it gets some angular velocity while walking, I wrote this line to prevent it, thoughts?
      this.body.body.setAngularVelocity(js_new(global.THREE.Vector3,0,0,0));
      if(this.isOnGround)
      this.playAnimation("Walk");
    }

    let deltaLengthSq = delta.lengthSq();

    if (deltaLengthSq > accel * accel)
    {
      delta = delta.normalize().multiplyScalar(accel);
    }
    
    let newVelocity = velocity.add(delta);
    this.body.body.setVelocity(newVelocity);

    this.dragDx = 0;
    this.dragDy = 0;
  }

  handlePlayerOrientation(){
    let angle = Math.atan2(-this.dragDx,-this.dragDy);
    let axis = js_new(global.THREE.Vector3,0,1,0);
    let quat = js_new(global.THREE.Quaternion);
    quat.setFromAxisAngle(axis,angle);
    this.body.body.setRotation(quat);
  }

  jump(){
    if(!this.isOnGround)
      return;
    let velocity = this.body.body.getVelocity();
    velocity.y += this.jumpVelo;
    this.body.body.setVelocity(velocity);
    this.canRecord = true;
  }

  onButtonPress(button: string): void {
    if (button == "AButton")
    {
      this.jump();
    }
  }
  
  onButtonHold(button: string): void {
    
  }

  onButtonRelease(button: string): void {
    
  }

  onDrag(dx: number, dy: number): void {
    this.dragDx = dx;
    this.dragDy = dy;
  }

  hasSubtype(button: string): boolean {
    return button == "AButton";
  }

  playAnimation(state:string){
    if(this.anim !== undefined)
      this.anim.playState(state);
    else console.error("No "+ShapeStateController.name+" is found on this body.");
  }
}