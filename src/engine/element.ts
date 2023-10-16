import { BodyHandle } from "./BodyHandle";

export abstract class Element
{
  body : BodyHandle;
  enabled : boolean;
  initialized: boolean;
  started: boolean;


  constructor(body : BodyHandle)
  {
    this.body = body;
    this.body.elements.push(this);
    this.enabled = true;
    this.initialized = false;
    this.started = false;
  }

  /*
    Called immediately when the body this element belongs to is created, after the constructors of all elements have been called.
    Any event listeners associated with this element should be added to GameplayScene.dispatcher here.
  */
  abstract onInit() : void;

  /*
    Called on the first frame the body exists in the scene.  Always called after the onInit() calls for each body in the scene.
  */
  abstract onStart() : void;
}