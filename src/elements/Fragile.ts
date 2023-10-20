import { BodyHandle, PhysicsBodyType } from "engine/BodyHandle";
import { Element } from "engine/Element";
import { GameplayScene } from "engine/GameplayScene";
import { HitPoints, DamageType } from "./HitPoints";
import { CollisionHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class Fragile extends Element implements CollisionHandler
{
  damageValue: number;
  damageType: DamageType | undefined;
  deltaVThreshold: number;
  cooldown: number;

  lastDamagedTime: number;

  constructor(body: BodyHandle, params: Partial<Fragile> = {})
  {
    super(body);
    this.damageValue = params.damageValue === undefined? 1 : params.damageValue;
    this.damageType = params.damageType === undefined? "blunt" : params.damageType;
    this.cooldown = params.cooldown === undefined? 0 : params.cooldown;
    this.deltaVThreshold = params.deltaVThreshold === undefined? 5 : params.deltaVThreshold;

    this.lastDamagedTime = -Infinity;
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
    const now = GameplayScene.instance.memory.timeSinceStart;
    
    if (now - this.lastDamagedTime >= this.cooldown)
    {
      if (contactDeltaV.length() >= this.deltaVThreshold)
      {
        const hpElement = this.body.getElement(HitPoints);

        if (hpElement !== undefined)
        {
          hpElement.damage(this.damageValue, this.damageType);
          this.lastDamagedTime = now;
        }
      }
    }
  }
}