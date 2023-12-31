import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Constants, Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class LookAt extends LMent implements UpdateHandler {
    targetBodyName: string;
    private targetBody: BodyHandle | undefined
    targetVector: Vector3 | undefined
    speed: number;
    allowVerticalLook: boolean;
    lookAway: boolean;

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }
    onStart(): void {

        if (this.targetBodyName !== Helpers.NA)
            this.changeTargetByBodyName(this.targetBodyName);
    }

    constructor(body: BodyHandle, id: number, params: Partial<LookAt> = {}) {
        super(body, id, params);

        this.targetBodyName = params.targetBodyName === undefined ? Helpers.NA : params.targetBodyName;

        if (this.targetBodyName === Helpers.NA)
            this.targetVector = params.targetVector === undefined ? Helpers.forwardVector.multiplyScalar(3).applyQuaternion(this.body.body.getRotation()) : params.targetVector;

        this.speed = params.speed === undefined ? 1 : params.speed;
        if (this.speed > 1)
            this.speed = 1;
        else if (this.speed < 0)
            this.speed = 0;

        this.lookAway = params.lookAway === undefined ? false : params.lookAway;
        this.allowVerticalLook = params.allowVerticalLook === undefined ? false : params.allowVerticalLook;
    }


    onUpdate(dt?: number | undefined): void {
        this.doLookAt();
    }

    doLookAt() {
        let myQuat = this.body.body.getRotation().clone();
        let finalQuat = this.calculateFinalQuat();
        if(finalQuat == undefined) return;
        this.body.body.setRotation(myQuat.slerp(finalQuat, this.speed));
    }

    calculateFinalQuat() : THREE.Quaternion | undefined {

        let myPos = this.body.body.getPosition();
        let myQuat = this.body.body.getRotation().clone();
        
        if (this.targetVector === undefined) return ;

        let planeOpposite = this.targetVector.z - myPos.z;
        let planeAdjacent = this.targetVector.x - myPos.x;
        let planeAngle = Math.atan2(planeAdjacent, planeOpposite);
        let planeAxis = Helpers.upVector;
        let planeQuat = Helpers.NewQuaternion().setFromAxisAngle(planeAxis, planeAngle);

        let finalQuat = planeQuat;
        if (this.allowVerticalLook) {
            let verticalOpposite = this.targetVector.clone().multiply(Helpers.xzVector).distanceTo(myPos.clone().multiply(Helpers.xzVector));
            let verticalAdjacent = myPos.y - this.targetVector.y;
            let verticalAngle = Math.atan2(verticalAdjacent, verticalOpposite);
            let verticalAxis = Helpers.rightVector.applyQuaternion(myQuat);
            let verticalQuat = Helpers.NewQuaternion().setFromAxisAngle(verticalAxis, verticalAngle);

            finalQuat = verticalQuat.multiply(planeQuat);
        }
        /*** Anas, please move this line to a new element that extends this one, named 'LookAway' ****/
        if (this.lookAway)
            finalQuat = finalQuat.multiply(Helpers.NewQuaternion().setFromAxisAngle(Helpers.upVector, Math.PI)); // Flip the final quaternion

        return finalQuat;
    }

    changeTargetByVector(newTarget: Vector3) {
        this.targetVector = newTarget;
    }

    changeTargetByBodyName(newTarget: string) {

        if (newTarget.toLowerCase() === Constants.Player)
            this.targetBody = GameplayScene.instance.memory.player;
        else
            this.targetBody = Helpers.findBodyInScene(newTarget);

        if (this.targetBody !== undefined)
            this.targetVector = this.targetBody.body.getPosition();
    }

    changeTargetByBodyId(targetId: number) {
        this.targetBody = GameplayScene.instance.getBodyById(targetId);
        if (this.targetBody !== undefined)
            this.targetVector = this.targetBody.body.getPosition();
    }

    lookAtComplete(tolerance: number = 0.01): boolean {
        let currentQuat = this.body.body.getRotation();
        let targetQuat = this.calculateFinalQuat();

        if (!targetQuat) {
            return false;
        }
        return currentQuat.angleTo(targetQuat) < tolerance;
    }

}
