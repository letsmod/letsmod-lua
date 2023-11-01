import { Collectable } from "./Collectable";
import { BodyHandle } from "engine/BodyHandle";
import { CollisionInfo} from "engine/MessageHandlers";
import { GameplayScene } from "engine/GameplayScene";

export class Coin extends Collectable
{
    constructor(body: BodyHandle, id: number, params: Partial<Collectable> = {})
    {
      super(body, id);
    }
    
    override collect(){
        GameplayScene.instance.clientInterface?.addScore(1); //does not work yet.
        console.log("SCORE +1");
        super.collect();
    }

    override onCollectAnimation(): void {
        this.body.body.getScale().subScalar(0.1);
    }

}