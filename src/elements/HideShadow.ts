import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";

export class HideShadow extends LMent
{
  constructor(body: BodyHandle, id: number, params: Partial<HideShadow> = {})
  {
    super(body, id, params);
  }

  onInit()
  {
    this.body.body.setCastShadow(false);
  }

  onStart(): void {
    
  }
}