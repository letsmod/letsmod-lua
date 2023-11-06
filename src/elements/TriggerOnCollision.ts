import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";

export class TriggerOnCollision extends LMent implements CollisionHandler
{
  triggerId : string | undefined;
  triggerContext: "local" | "group" | "global";
  triggerOnCollisionWithElementType: string | undefined;

  constructor(body : BodyHandle, id : number, params : Partial<TriggerOnCollision> = {})
  {
    super(body, id, params);
    this.triggerId = params.triggerId;
    this.triggerContext = params.triggerContext === undefined? "group" : params.triggerContext;
    this.triggerOnCollisionWithElementType = params.triggerOnCollisionWithElementType;
  }

  onInit()
  {
    GameplayScene.instance.dispatcher.addListener("collision", this);
  }

  onStart()
  {
  }

  onCollision(info: CollisionInfo) {
    if (this.triggerOnCollisionWithElementType === undefined)
    {
      this.sendTrigger();
    }
    else
    {
      let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
      if (other?.getElementByTypeName(this.triggerOnCollisionWithElementType) !== undefined)
      {
        this.sendTrigger();
      }
    }
  }

  sendTrigger()
  {
    if (this.triggerId !== undefined)
    {
      GameplayScene.instance.dispatcher.onTrigger(this, this.triggerId, this.triggerContext);
    }
  }
}