import { global, js_new } from "js";
import { Object3D } from "three";
import { Element } from "./element";
import Ammo from "ammojs3";

export class BodyHandle
{
  readonly body: Object3D;
  readonly physicsBody: Ammo.btRigidBody;
  elements: Element[] = [];

  constructor(bodyNode: Object3D, physicsBody: Ammo.btRigidBody)
  {
    this.body = bodyNode;
    this.physicsBody = physicsBody;
  }

  getElement <U extends Element> (T : new (...args: any[]) => U ) : U | null
  {
    for (let i = 0; i < this.elements.length; i++)
    {
      if (this.elements[i] instanceof T)
      {
        return this.elements[i] as U;
      }
    }

    return null;
  }

  addElement(elem : Element)
  {
    this.elements.push(elem);
  }

  initializeElements()
  {
    for (var elem of this.elements)
    {
      if (!elem.initialized)
      {
        elem.onInit();
        elem.initialized = true;
      }
    }
  }

  startElements()
  {
    for (var elem of this.elements)
    {
      if (!elem.started)
      {
        elem.onStart();
        elem.started = true;
      }
    }
  }
}