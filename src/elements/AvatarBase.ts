import { BodyHandle } from "engine/BodyHandle";
import { GameplayMemory } from "engine/GameplayMemory";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo, HitPointChangeHandler, UpdateHandler } from "engine/MessageHandlers";

export class AvatarBase extends LMent implements UpdateHandler, HitPointChangeHandler, CollisionHandler
{
  constructor(body: BodyHandle, id: number, params: Partial<AvatarBase> = {})
  {
    super(body, id, params);
  }
  
  onCollision(info: CollisionInfo): void {
    GameplayScene.instance.getBodyById
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("update", this);
    GameplayScene.instance.dispatcher.addListener("hitPointsChanged", this);
    GameplayScene.instance.dispatcher.addListener("collision", this);
    GameplayScene.instance.memory.player = this.body;
  }

  initRotation()
  {
    let rotation = this.body.body.getRotation().clone();
    //Note: X is swapped with W, it appears our coordinate system is W,Y,Z,X instead of X,Y,Z,W
    let yaw:number = Math.atan2(2 * (rotation.w * rotation.y + rotation.x * rotation.z), rotation.x * rotation.x + rotation.w * rotation.w - rotation.y * rotation.y - rotation.z * rotation.z);
    rotation.setFromAxisAngle(Helpers.upVector,yaw);
    this.body.body.setRotation(rotation);
    
  }

  onStart(): void {
    this.initRotation();
    this.body.body.setAngularVelocity(Helpers.zeroVector);
  }

  onUpdate(): void {
    this.sinkCheck();
  }

  sinkCheck()
  {
    if(this.body.body.getPosition().y<0)
      this.lose();
  }

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number): void {
    //Update healthbar goes here.
    if (source === this.body && currentHP <= 0)
    {
      this.lose();
    }
  }

  lose()
  {
    // death effect goes here
    GameplayScene.instance.clientInterface?.loseMod();
  }
}