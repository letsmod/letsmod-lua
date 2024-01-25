import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";

export class ThrowTarget extends LMent
{
  constructor(body: BodyHandle, id: number, params: Partial<ThrowTarget> = {})
  {
    super(body, id, params);
  }

  onInit()
  {
  }

  onStart()
  {
  }
}