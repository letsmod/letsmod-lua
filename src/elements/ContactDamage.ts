import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { HitPoints, DamageType } from "./HitPoints";
import { CollisionHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class ContactDamage extends LMent implements CollisionHandler
{
  damageValue: number;
  damageType: DamageType | undefined;
  teamFlags: number | undefined;
  cooldown: number;

  private contactCooldowns : {[key:number] : number};

  constructor(body: BodyHandle, params: Partial<ContactDamage> = {})
  {
    super(body);
    this.damageValue = params.damageValue === undefined? 1 : params.damageValue;
    this.damageType = params.damageType;
    this.teamFlags = params.teamFlags;
    this.cooldown = params.cooldown === undefined? 0 : params.cooldown;

    this.contactCooldowns = {};
  }

  onInit()
  {
    GameplayScene.instance.dispatcher.addListener("collision", this);
  }

  onStart()
  {
  }

  onCollision(other: BodyHandle | undefined, contactPoint: Vector3, contactDeltaV: Vector3)
  {
    if (other !== undefined)
    {
      const now = GameplayScene.instance.memory.timeSinceStart;
      const hpElement = other.getElement(HitPoints);
  
      if (hpElement !== undefined)
      {
        if (this.contactCooldowns[other.body.id] === undefined || now - this.contactCooldowns[other.body.id] >= this.cooldown)
        {
          hpElement.damage(this.damageValue, this.damageType, this.teamFlags);
          this.contactCooldowns[other.body.id] = now;
        }
      }
    }
  }
}