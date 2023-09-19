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
    console.log("typeof T ", T);
    for (let i = 0; i < this.elements.length; i++)
    {
      if (this.elements[i] instanceof T)
      {
        return this.elements[i] as U;
      }
    }

    return null;
  }

  // getElementOfClass <U extends typeof Element> (T : U) : Element | null
  // {
  //   console.log("typeof T ", T);
  //   for (let i = 0; i < this.elements.length; i++)
  //   {
  //     if (this.elements[i] instanceof T)
  //     {
  //       return this.elements[i];
  //     }
  //   }

  //   return null;
  // }
}

console.log("beep");

export class blarg extends Element
{
  onInit(): void {
    
  }
  onStart(): void {
  }
}

let boo = new BodyHandle(<any>null, <any>null);
let blargo = new blarg(boo);

let boop = boo.getElement(blarg);

console.log("boop ", boop);

console.log("beep ", boo.getElement(<any>BodyHandle));