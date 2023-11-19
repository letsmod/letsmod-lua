import { Vector3 } from "three";
import { BodyHandle } from "../engine/BodyHandle";
import { GameplayScene } from "../engine/GameplayScene";
import { LMent } from "../engine/LMent";
import { UpdateHandler } from "../engine/MessageHandlers";
import { Helpers } from "engine/Helpers";

export class Buoyant extends LMent implements UpdateHandler {
    restorationForceMax: number;
    restorationSpeedMax: number;
    rotationReset: Vector3;
    initY: number;

    constructor(body: BodyHandle, id: number, params: Partial<Buoyant> = {}) {
        super(body, id, params);
        this.restorationForceMax = params.restorationForceMax === undefined ? 0 : params.restorationForceMax;
        this.restorationSpeedMax = params.restorationSpeedMax === undefined ? 0 : params.restorationSpeedMax;
        this.rotationReset = Helpers.NewVector3(0, 1, 0);
        if (params.rotationReset !== undefined) 
            this.rotationReset.copy(params.rotationReset);
        this.initY = params.initY === undefined ? 0 : params.initY;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }

    onStart(): void {
        this.body.body.setCustomGravity(Helpers.zeroVector);
        this.initY = this.body.body.getPosition().y;
    }

    onUpdate(): void {
        this.restorePosition();
        this.restoreRotation();
    }

    restorePosition(): void {
        let force = Helpers.NewVector3(0, (this.initY - this.body.body.getPosition().y) * this.restorationForceMax, 0);
        this.body.body.applyCentralForce(force);
    }

    restoreRotation(): void {
        let rotation = Helpers.NewVector3(this.rotationReset.x, this.rotationReset.y, this.rotationReset.z);

        let localUp = Helpers.upVector.applyQuaternion(this.body.body.getRotation());

        let quaternion = Helpers.NewQuaternion().setFromUnitVectors(localUp.normalize(), rotation.normalize());
        const { axis, angle } = this.quaternionToAxisAngle(quaternion);

        let rotatedVector = axis.multiplyScalar(angle * this.restorationSpeedMax);
        this.body.body.setAngularVelocity(rotatedVector);
    }

    quaternionToAxisAngle(quaternion: THREE.Quaternion): { axis: THREE.Vector3; angle: number } {
        quaternion.normalize();
        const angle = 2 * Math.acos(quaternion.w);
        let sqrt = Math.sqrt(1 - quaternion.w * quaternion.w);
        let axis = Helpers.NewVector3(quaternion.x, quaternion.y, quaternion.z);
        if (sqrt < 0.001)
            axis = Helpers.rightVector;
        else
            axis.divideScalar(sqrt);

        return { axis, angle };
    }
}
