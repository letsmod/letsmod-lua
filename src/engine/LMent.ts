import { BodyHandle } from "./BodyHandle";

export abstract class LMent
{
  body : BodyHandle;
  initialized: boolean;
  started: boolean;
  id: number;
  name: string;

  private _enabled : boolean;

  get enabled() : boolean
  {
    return this._enabled;
  }

  set enabled(value: boolean)
  {
    if (value != this._enabled)
    {
      this._enabled = value;
      if (this._enabled)
      {
        this.onEnable();
      }
      else
      {
        this.onDisable();
      }
    }
  }

  constructor(body : BodyHandle, id: number, params: Partial<LMent>)
  {
    this.body = body;
    this._enabled = params.enabled === undefined? true : params.enabled;
    this.initialized = false;
    this.started = false;
    this.id = id;
    this.name = params.name || "";
  }

  convertArray(arr : any)
  {
    if (arr === undefined)
    {
      return undefined;
    }

    let result = [];

    for (let key in arr)
    {
      result.push(arr[key]);
    }
    return result;
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

  /*
    Called whenever the element's enabled property is changed from false to true.
    Note: will not be called on initialization if the element's initial state is enabled.
  */
  onEnable()
  {

  }

  /*
    Called whenever the element's enabled property is changed from true to false.
    Note: will not be called on initialization if the element's initial state is disabled.
  */
  onDisable()
  {

  }
}