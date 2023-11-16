import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";

export class LockRotationAxis extends LMent {

  xAxis: boolean;
  yAxis: boolean
  zAxis: boolean

  constructor(body: BodyHandle, id: number, params: Partial<LockRotationAxis> = {}) {
    super(body, id, params);
    this.xAxis = params.xAxis === undefined ? false : params.xAxis;
    this.yAxis = params.yAxis === undefined ? false : params.yAxis;
    this.zAxis = params.zAxis === undefined ? false : params.zAxis;
  }

  onInit(): void {
    this.body.body.lockRotation(this.xAxis, this.yAxis, this.zAxis);
  }
  onStart(): void {

  }
}
