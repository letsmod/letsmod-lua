import { BodyHandle } from "./bodyHandle";
import Ammo from "ammojs3";
import { Object3D } from "three";
import { MessageDispatcher } from "./messageDispatcher";

export class GameplayScene
{
  static _instance : GameplayScene;
  static get instance() {
    if (this._instance == null)
    {
      this._instance = new GameplayScene();
    }
    return this._instance;
  }

  bodies: BodyHandle[] = [];
  bodyIdMap : Map<number, BodyHandle> = new Map<number, BodyHandle>();
  dispatcher : MessageDispatcher = new MessageDispatcher();

  private constructor()
  {

  }

  addBody (bodyNode: Object3D, physicsBody: Ammo.btRigidBody)
  {
    let handle = new BodyHandle(bodyNode, physicsBody)
    this.bodies.push(handle);
    this.bodyIdMap.set(bodyNode.id, handle);
  }

  getBodyById(id : number) : BodyHandle | undefined
  {
    return this.bodyIdMap.get(id);
  }

  clear()
  {
    this.bodies = [];
  }

  preUpdate()
  {
    for (var body of this.bodies)
    {
      body.initializeElements();
    }
    
    for (var body of this.bodies)
    {
      body.startElements();
    }
  }

  update()
  {
    this.dispatcher.onUpdate();
  }
}