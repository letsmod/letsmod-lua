import { Element } from "./Element";

export enum PhysicsBodyType {
  physical = 0,
  kinematic = 1,
  hologram = 2,
}

// interface to a javascript object which provides a lua-compatible interface for the js BodyView scene node
export interface BodyPointer extends THREE.Object3D
{
  getMass() : number;

  getVelocity() : THREE.Vector3;
  setVelocity(velocity: THREE.Vector3) : void;
  applyCentralForce(force: THREE.Vector3) : void;
  
  getAngularVelocity() : THREE.Vector3;
  setAngularVelocity(angularVelocity: THREE.Vector3) : void;
  applyTorque(torque: THREE.Vector3) : void;

  lockRotation(xAxis: boolean, yAxis: boolean, zAxis: boolean) : void;

  // internal use; use gameplayScene.destroyBody instead
  destroyBody() : void;
  // internal use; use gameplayScene.cloneBody instead
  cloneBody() : BodyPointer;

  getPhysicsBodyType() : PhysicsBodyType;
}

// lua object
export class BodyHandle
{
  readonly body: BodyPointer;
  elements: Element[] = [];

  constructor(bodyNode: BodyPointer)
  {
    this.body = bodyNode;
  }

  getElement <U extends Element> (T : new (...args: any[]) => U ) : U | undefined
  {
    for (let i = 0; i < this.elements.length; i++)
    {
      if (this.elements[i] instanceof T)
      {
        return this.elements[i] as U;
      }
    }

    return undefined;
  }

  addElement(elem : Element)
  {
    this.elements.push(elem);
  }

  // createElement <U extends Element> (T : new (body: BodyHandle, params: Partial<U>) => U, params: Partial<U>) : U
  // {
  //   let elem = new T(this, params);
  //   return elem;
  // }

  initializeElements()
  {
    for (let elem of this.elements)
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
    for (let elem of this.elements)
    {
      if (!elem.started)
      {
        elem.onStart();
        elem.started = true;
      }
    }
  }
}