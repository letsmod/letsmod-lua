import { BodyPointer, BodyHandle } from "./BodyHandle";
import { MessageDispatcher } from "engine/MessageDispatcher";
import { GameplayMemory } from "engine/GameplayMemory";

export class GameplayScene
{
  static _instance : GameplayScene;
  static get instance() {
    if (this._instance == undefined)
    {
      this._instance = new GameplayScene();
    }
    return this._instance;
  }

  bodies: BodyHandle[] = [];
  prefabs: BodyHandle[] = [];
  bodyIdMap : Map<number, BodyHandle> = new Map<number, BodyHandle>();
  dispatcher : MessageDispatcher = new MessageDispatcher(this);
  memory : GameplayMemory = new GameplayMemory();

  private constructor()
  {
  }

  addBody (bodyNode: BodyPointer)
  {
    let handle = new BodyHandle(bodyNode);
    handle.isInScene = true;
    this.bodies.push(handle);
    this.bodyIdMap.set(bodyNode.id, handle);
    return handle;
  }

  addPrefab (bodyNode: BodyPointer)
  {
    let handle = new BodyHandle(bodyNode);
    this.prefabs.push(handle);
    return handle;
  }

  getBodyById(id : number) : BodyHandle | undefined
  {
    return this.bodyIdMap.get(id);
  }

  clear()
  {
    this.bodies = [];
    this.bodyIdMap.clear();
    this.prefabs = [];
    this.dispatcher.clearListeners();
  }

  initializeMemory(memoryOverride : Partial<GameplayMemory>)
  {
    this.memory = {...new GameplayMemory(), ...memoryOverride};
  }

  preUpdate(dt : number)
  {
    this.memory.timeSinceStart += dt;
    for (let body of this.bodies)
    {
      body.initializeElements();
    }
    
    for (let body of this.bodies)
    {
      body.startElements();
    }

    this.dispatcher.updateFunctionQueue(dt);
  }

  update()
  {
    this.dispatcher.onUpdate();
  }

  cloneBody(body: BodyHandle) : BodyHandle | undefined
  {
    let clonePointer = body.body.cloneBody();
    if (clonePointer !== undefined)
    {
      return this.addBody(clonePointer);
    }
    return undefined;
  }

  clonePrefab(prefabName: string)
  {
    for (let prefab of this.prefabs)
    {
      if (prefab.body.name == prefabName)
      {
        return this.cloneBody(prefab);
      }
    }
    return undefined;
  }

  destroyBody(body: BodyHandle)
  {
    let index = this.bodies.indexOf(body);
    if (index >= 0)
    {
      this.dispatcher.onActorDestroyed(body);
      this.dispatcher.removeAllListenersFromBody(body);

      this.bodies.splice(index, 1);
      body.body.destroyBody();
      body.isInScene = false;
    }
  }
}