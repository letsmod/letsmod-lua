import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class LookAt extends LMent implements UpdateHandler {
    targetVector: Vector3 | undefined
    speed: number;
    planeOnly: boolean;

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update",this);
    }
    onStart(): void {
    }

    constructor(body: BodyHandle, id: number, params: Partial<LookAt> = {}) {
        super(body, id, params);

        this.targetVector = params.targetVector === undefined ? Helpers.forwardVector.multiplyScalar(3).applyQuaternion(this.body.body.getRotation()) : params.targetVector;
        Helpers.LogVector(this.targetVector);
        
        this.speed = params.speed === undefined ? 1 : params.speed;
        if (this.speed > 1)
            this.speed = 1;
        else if (this.speed < 0)
            this.speed = 0;

        this.planeOnly = params.planeOnly === undefined ? true : params.planeOnly;
    }

    onUpdate(dt?: number | undefined): void {
        this.doLookAt();
    }

    doLookAt() {
        if (this.targetVector === undefined) return;
        console.log("Looking");

        let myPos = this.body.body.getPosition();
        let myQuat = this.body.body.getRotation().clone();

        let planeOpposite = this.targetVector.z - myPos.z;
        let planeAdjacent = this.targetVector.x - myPos.x;
        let planeAngle = Math.atan2(planeOpposite, planeAdjacent);
        let planeAxis = Helpers.upVector;
        let planeQuat = Helpers.NewQuaternion().setFromAxisAngle(planeAxis, planeAngle);

        let finalQuat = planeQuat;
        if (!this.planeOnly)
        {
            let verticalOpposite = this.targetVector.clone().multiply(Helpers.xzVector).distanceTo(myPos.clone().multiply(Helpers.xzVector));
            let verticalAdjacent = myPos.y - this.targetVector.y;
            let verticalAngle = Math.atan2(verticalOpposite, verticalAdjacent);
            let verticalAxis = Helpers.rightVector.applyQuaternion(myQuat);
            let verticalQuat = Helpers.NewQuaternion().setFromAxisAngle(verticalAxis, verticalAngle);

            finalQuat = verticalQuat.multiply(planeQuat);
        }

        this.body.body.setRotation(myQuat.slerp(finalQuat, this.speed));
    }

    updateTarget(newTarget:Vector3)
    {
        this.targetVector = newTarget;
    }

}
