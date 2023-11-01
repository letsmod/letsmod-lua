import { BodyHandle } from "./BodyHandle";

export abstract class LMent
{
  body : BodyHandle;
  enabled : boolean;
  initialized: boolean;
  started: boolean;
  id: number;

  constructor(body : BodyHandle, id: number, params: Partial<LMent>)
  {
    this.body = body;
    this.body.elements.push(this);
    this.enabled = params.enabled === undefined? true : params.enabled;
    this.initialized = false;
    this.started = false;
    this.id = id;
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