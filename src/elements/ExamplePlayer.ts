import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { ButtonHandler, DragGestureHandler, UpdateHandler } from "engine/MessageHandlers";
import { global, js_new } from "js";

export class ExamplePlayer extends LMent implements ButtonHandler, DragGestureHandler, UpdateHandler
{
  maxSpeed: number; // meters per second
  acceleration: number; // meters per second per second
  deceleration: number; // meters per second per second

  private dragDx = 0;
  private dragDy = 0;

  constructor(body: BodyHandle, params: Partial<ExamplePlayer> = {})
  {
    super(body);
    this.maxSpeed = params.maxSpeed === undefined? 3 : params.maxSpeed;
    this.acceleration = params.acceleration === undefined? this.maxSpeed * 5 : params.acceleration;
    this.deceleration = params.deceleration === undefined? this.maxSpeed * 5 : params.deceleration;
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("button", this);
    GameplayScene.instance.dispatcher.addListener("drag", this);
    GameplayScene.instance.dispatcher.addListener("update", this);
    GameplayScene.instance.memory.player = this.body;
  }

  onStart(): void {
    
  }

  onUpdate(): void {
    let velocity = this.body.body.getVelocity();
    let planarVelocity = js_new(global.THREE.Vector3, velocity.x, 0, velocity.z);
    
    let targetX = this.dragDx * this.maxSpeed;
    let targetZ = this.dragDy * this.maxSpeed;
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

  hasSubtype(button: string): boolean {
    return button == "AButton";
  }
}