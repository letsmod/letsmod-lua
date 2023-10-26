import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { ActorDestructionHandler, HitPointChangeHandler } from "engine/MessageHandlers";

export class CreatePrefabsOnDestroyed extends LMent implements ActorDestructionHandler
{
  private destroyed: boolean;
  prefabNames: string[];

  constructor(body: BodyHandle, id: number, params: Partial<CreatePrefabsOnDestroyed> = {})
  {
    super(body, id);
    this.destroyed = false;
    this.prefabNames = params.prefabNames === undefined? [] : params.prefabNames;
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("actorDestroyed", this);
  }

  onStart(): void {
    
  }

  onActorDestroyed(actor: BodyHandle): void {
    if (!this.destroyed && actor == this.body)
    {
      this.destroyed = true;
      for (let prefabName of this.prefabNames)
      {
        let prefab = GameplayScene.instance.clonePrefab(prefabName);
        if (prefab)
        {
          prefab.body.setPosition(this.body.body.getPosition());
          prefab.body.setRotation(this.body.body.getRotation());
        }  
      }
    }
  }
}