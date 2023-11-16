import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { ActorDestructionHandler, CollisionHandler, CollisionInfo, HitPointChangeHandler, UpdateHandler } from "engine/MessageHandlers";

export class AvatarBase extends LMent implements UpdateHandler, HitPointChangeHandler, CollisionHandler, ActorDestructionHandler
{
  constructor(body: BodyHandle, id: number, params: Partial<AvatarBase> = {})
  {
    super(body, id, params);
  }
  onActorDestroyed(actor: BodyHandle): void {
    this.lose();
  }
  hasSubtype?(subtype: string): boolean {
    throw new Error("Method not implemented.");
  }
  
  onCollision(info: CollisionInfo): void {
    GameplayScene.instance.getBodyById;
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
    rotation.setFromAxisAngle(Helpers.upVector,Helpers.GetYaw(rotation));
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
