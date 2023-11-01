import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo, UpdateHandler } from "engine/MessageHandlers";
import { DestroyOnZeroHP } from "./DestroyOnZeroHP";

export class Collectable extends LMent implements CollisionHandler, UpdateHandler
{
    isCollected:boolean = false;
    constructor(body: BodyHandle, id: number, params: Partial<Collectable> = {})
    {
      super(body, id);
    }

    onCollision(info: CollisionInfo): void {
        if(info.getOtherObjectId() === GameplayScene.instance.memory.player?.body.id)
            this.collect();
    }
  
    onInit(): void {
      GameplayScene.instance.dispatcher.addListener("collision", this);
      GameplayScene.instance.dispatcher.addListener("update", this);
    }
  
    onStart(): void {
      
    }

    onUpdate(): void {
      if(this.isCollected)
        this.onCollectAnimation();
      if(this.body.body.getScale().x<=0)
        this.destroyMe();

    }

    destroyMe()
    {
      GameplayScene.instance.destroyBody(this.body);
    }

    //Overridden by children
    public collect(){
        this.isCollected = true;
    }

    public onCollectAnimation(){

    }

}