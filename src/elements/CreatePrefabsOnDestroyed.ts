import { BodyHandle } from "engine/BodyHandle";
import { Element } from "engine/Element";
import { GameplayScene } from "engine/GameplayScene";
import { ActorDestructionHandler, HitPointChangeHandler } from "engine/MessageHandlers";

export class CreatePrefabsOnDestroyed extends Element implements ActorDestructionHandler
{
  destroyed: boolean;
  prefabNames: string[];

  constructor(body: BodyHandle, params: Partial<CreatePrefabsOnDestroyed> = {})
  {
    super(body);
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
      console.log("Creating prefabs", this.prefabNames, this.prefabNames.length);
      this.destroyed = true;
      for (let prefabName of this.prefabNames)
      {
        console.log("name", prefabName);
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