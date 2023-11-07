import { BodyHandle } from "engine/BodyHandle";
import { GameplayMemory } from "engine/GameplayMemory";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { ButtonHandler, DragGestureHandler, HitPointChangeHandler, UpdateHandler } from "engine/MessageHandlers";
import { global, js_new } from "js";
import { Euler } from "three";
import { radToDeg } from "three/src/math/MathUtils";

export class ExamplePlayer extends LMent implements ButtonHandler, DragGestureHandler, UpdateHandler, HitPointChangeHandler
{
  maxSpeed: number; // meters per second
  acceleration: number; // meters per second per second
  deceleration: number; // meters per second per second

  private dragDx = 0;
  private dragDy = 0;

  arrayTest: {x: number, y: number, z: number}[];

  constructor(body: BodyHandle, id: number, params: Partial<ExamplePlayer> = {})
  {
    super(body, id, params);
    this.maxSpeed = params.maxSpeed === undefined? 3 : params.maxSpeed;
    this.acceleration = params.acceleration === undefined? this.maxSpeed * 5 : params.acceleration;
    this.deceleration = params.deceleration === undefined? this.maxSpeed * 5 : params.deceleration;
    this.arrayTest = this.convertArray(params.arrayTest) || [];

    console.log("is array", Array.isArray(this.arrayTest));
    console.log("testing array");
    console.log("length", this.arrayTest.length);
    for (let i = 0; i < this.arrayTest.length; i++)
    {
      console.log(this.arrayTest[i].x, this.arrayTest[i].y, this.arrayTest[i].z);
    }
    console.log("test b");
    this.arrayTest.forEach(v => {
      console.log(v.x, v.y, v.z);
    });
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("button", this);
    GameplayScene.instance.dispatcher.addListener("drag", this);
    GameplayScene.instance.dispatcher.addListener("update", this);
    GameplayScene.instance.dispatcher.addListener("hitPointsChanged", this);
    GameplayScene.instance.memory.player = this.body;
    this.body.body.lockRotation(true,false,true);
  }

  onStart(): void {
    
  }

  onUpdate(): void {
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
    }
    else
    {
      accel = this.acceleration / GameplayScene.instance.memory.frameRate;
      this.handlePlayerOrientation();
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

  onButtonPress(button: string): void {
    if (button == "AButton")
    {
      let velocity = this.body.body.getVelocity();
      velocity.y += 10;
      this.body.body.setVelocity(velocity);
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

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number): void {
    if (source === this.body && currentHP <= 0)
    {
      // death effect goes here
      GameplayScene.instance.clientInterface?.loseMod();
    }
  }

  hasSubtype(button: string): boolean {
    return button == "AButton";
  }
}