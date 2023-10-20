import { BodyHandle } from "engine/BodyHandle";
import { Element } from "engine/Element";
import { GameplayScene } from "engine/GameplayScene";
import { HitPointChangeHandler } from "engine/MessageHandlers";

export class DestroyOnZeroHP extends Element implements HitPointChangeHandler
{
  destroyed: boolean;

  constructor(body: BodyHandle)
  {
    super(body);
    this.destroyed = false;
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("hitPointsChanged", this);
  }

  onStart(): void {
    
  }

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number): void {
    if (source == this.body && currentHP <= 0 && !this.destroyed)
    {
      GameplayScene.instance.destroyBody(this.body);
      this.destroyed = true;
    }
  }
}