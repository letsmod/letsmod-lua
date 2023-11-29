import { LMent } from "./LMent";

export enum PhysicsBodyType {
  physical = 0,
  kinematic = 1,
  hologram = 2,
}

// interface to a javascript object which provides a lua-compatible interface for the js ComponentView scene node
export interface ShapePointer
{
  get id(): number;
  get name(): string;

  getColor() : THREE.Color;

  setColor(color : THREE.Color) : void;

  getVisible() : boolean;

  setVisible(visible: boolean) : void;

  setCastShadow(shadowCasting: boolean) : void;
}

// interface to a javascript object which provides a lua-compatible interface for the js BodyView scene node
export interface BodyPointer
{
  get id() : number;
  get name() : string;

  getShapes() : ShapePointer[];

  getMass() : number;

  getVelocity() : THREE.Vector3;
  setVelocity(velocity: THREE.Vector3) : void;
  applyCentralForce(force: THREE.Vector3) : void;
  
  getAngularVelocity() : THREE.Vector3;
  setAngularVelocity(angularVelocity: THREE.Vector3) : void;
  applyTorque(torque: THREE.Vector3) : void;

  lockRotation(xAxis: boolean, yAxis: boolean, zAxis: boolean) : void;
  setCustomGravity(gravity: THREE.Vector3) : void;

  getPhysicsBodyType() : PhysicsBodyType;

  getPosition() : THREE.Vector3;

  setPosition(position: THREE.Vector3) : void;

  offsetPosition(offset: THREE.Vector3) : void;

  getRotation() : THREE.Quaternion;

  setRotation(rotation: THREE.Quaternion) : void;

  applyRotation(rotation: THREE.Quaternion) : void;

  getScale() : THREE.Vector3;

  setScale(scale: THREE.Vector3) : void; // does not scale the physics body; only changes the visual size

  getVisible() : boolean;

  setVisible(visible: boolean) : void;

  setCastShadow(shadowCasting: boolean) : void;

  // internal use; use gameplayScene.destroyBody / cloneBody instead
  destroyBody() : void;
  cloneBody() : BodyHandle;
}

// lua object
export class BodyHandle
{
  readonly body: BodyPointer;
  elements: LMent[] = [];
  isInScene: boolean = false;
  bodyGroup: BodyHandle[] = [this];

  // do not use directly; use gameplayScene.addBody / addPrefab instead
  constructor(bodyNode: BodyPointer)
  {
    this.body = bodyNode;
  }

  getElement <U extends LMent> (T : new (...args: any[]) => U ) : U | undefined
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

  getElementByTypeName(name: string)
  {
    for (let i = 0; i < this.elements.length; i++)
    {
      if (this.elements[i].constructor.name == name)
      {
        return this.elements[i];
      }
    }

    return undefined;
  }

  getElementByName(name:string)
  {
    for (let i = 0; i < this.elements.length; i++)
    {
      if (this.elements[i].name == name)
      {
        return this.elements[i];
      }
    }

    return undefined;
  }

  getAllElements <U extends LMent> (T : new (...args: any[]) => U ) : U[]
  {
    let arr =[];
    for (let i = 0; i < this.elements.length; i++)
    {
      if (this.elements[i] instanceof T)
      {
        arr.push(this.elements[i] as U);
      }
    }

    return arr;
  }

  getAllElementsByTypeName (typeName:string ) : LMent[]
  {
    let arr =[];
    let count=0;
    for (let i = 0; i < this.elements.length; i++)
    {
      if (this.elements[i].constructor.name == typeName)
      {
        arr.push(this.elements[i]);
      }
    }

    return arr;
  }

  getAllElementsByName (name:string ) : LMent[]
  {
    let arr =[];
    for (let i = 0; i < this.elements.length; i++)
    {
      if (this.elements[i].name == name)
      {
        arr.push(this.elements[i]);
      }
    }

    return arr;
  }


  addElement(elem : LMent)
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