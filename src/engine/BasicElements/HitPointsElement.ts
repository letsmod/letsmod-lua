import { BodyHandle } from "engine/bodyHandle";
import { Element } from "../element";
import { GameplayScene } from "engine/gameplayScene";

export class HitpointsElement extends Element
{
  maxHitpoints : number;
  hitpoints : number;

  constructor(body: BodyHandle, maxHitpoints : number)
  {
    super(body);
    this.maxHitpoints = maxHitpoints;
    this.hitpoints = maxHitpoints;
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