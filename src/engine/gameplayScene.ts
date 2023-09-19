import { BodyHandle } from "./bodyHandle";
import { js_new, global } from "js";
import Ammo from "ammojs3";
import { Object3D } from "three";

export class GameplayScene
{
  bodies: BodyHandle[] = [];

  constructor()
  {

  }

  addBody (bodyNode: Object3D, physicsBody: Ammo.btRigidBody)
  {
    this.bodies.push(new BodyHandle(bodyNode, physicsBody));
  }

  clear()
  {
    this.bodies = [];
  }
}