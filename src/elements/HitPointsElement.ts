import { BodyHandle } from "engine/BodyHandle";
import { Element } from "engine/Element";
import { GameplayScene } from "engine/GameplayScene";

export class HitPointsElement extends Element
{
  maxHitpoints : number;
  hitpoints : number;

  constructor(body: BodyHandle, params: Partial<HitPointsElement> = {})
  {
    super(body);
    this.maxHitpoints = params.maxHitpoints === undefined? 1: params.maxHitpoints;
    this.hitpoints = params.hitpoints === undefined? this.maxHitpoints : params.hitpoints;
  }

  onInit()
  {
  }

  onStart()
  {
  }

  damage(amount : number)
  {
    let prevHitpoints = this.hitpoints;
    this.hitpoints -= amount;
    if (this.hitpoints < 0)
    {
      this.hitpoints = 0;
    }
    if (this.hitpoints > this.maxHitpoints)
    {
      this.hitpoints = this.maxHitpoints;
    }

    GameplayScene.instance.dispatcher.onHitPointChange(this.body, prevHitpoints, this.hitpoints);
  }

  heal (amount : number)
  {
    this.damage(-amount);
  }
}