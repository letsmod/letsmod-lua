import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";

export class Collectible extends LMent implements UpdateHandler
{
    collectDistance :number;
    protected isCollected:boolean = false;
    constructor(body: BodyHandle, id: number, params: Partial<Collectible> = {})
    {
      super(body, id,params);
      this.collectDistance = params.collectDistance === undefined?1:params.collectDistance;
    }

    onInit(): void {
      GameplayScene.instance.dispatcher.addListener("update", this);
    }
  
    onStart(): void {
    }

    onUpdate(): void {
      if(this.distanceOfPlayer() <= this.collectDistance)
        this.collect();
      if(this.isCollected)
        this.onCollectAnimation();
      if(this.body.body.getScale().x<=0)
        this.destroyMe();

    }

    distanceOfPlayer ():number
    {
      let player = GameplayScene.instance.memory.player;
      if(player === undefined)
        return 0;
      
      return this.body.body.getPosition().distanceTo(player.body.getPosition());
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
