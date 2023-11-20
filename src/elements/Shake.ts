import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { global, js_new } from "js";
import { Helpers } from "engine/Helpers";

export class Shake extends LMent implements UpdateHandler, TriggerHandler {
    movementAmplitude: Vector3;
    rotationAmplitude: number;
    duration: number;
    startTime: number;
    isActive: boolean;
    originalPosition: Vector3;
    originalRotation: THREE.Quaternion;
    triggerId: string;
    triggerContext: "local" | "group" | "global";

    constructor(body: BodyHandle, id: number, params: Partial<Shake> = {}) {
        super(body, id, params);

        this.movementAmplitude = params.movementAmplitude === undefined ? js_new(global.THREE.Vector3, 0.1, 0.1, 0.1) : params.movementAmplitude;
        this.rotationAmplitude = params.rotationAmplitude === undefined ? 0.1 : params.rotationAmplitude;
        this.duration = params.duration === undefined ? 1 : params.duration;
        this.startTime = 0;
        this.isActive = true;
        this.originalPosition = this.body.body.getPosition().clone();
        this.originalRotation = this.body.body.getRotation().clone();
        this.triggerId = params.triggerId === undefined ? "" : params.triggerId;
        this.triggerContext = params.triggerContext === undefined ? "local" : params.triggerContext;
    }

    hasSubtype(subtype: string): boolean {
        return subtype === this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
            this.shake();
    }

    onInit(): void {
        GameplayScene._instance.dispatcher.addListener("update", this);
    }

    onStart(): void {
        this.startTime = GameplayScene.instance.memory.timeSinceStart;
    }


    private applyShake(): void {
        if (!this.isActive) return;

        let elapsedTime = GameplayScene.instance.memory.timeSinceStart - this.startTime;
        if (elapsedTime > this.duration) {
            this.isActive = false;
            this.body.body.setPosition(this.originalPosition);
            this.body.body.setRotation(this.originalRotation);
            return;
        }

        let shakeFactor = 1 - (elapsedTime / this.duration);
        let movementShake = js_new(global.THREE.Vector3,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).multiply(this.movementAmplitude).multiplyScalar(shakeFactor);

        let rotationShake = (Math.random() - 0.5) * 2 * this.rotationAmplitude * shakeFactor;

        let axis = js_new(global.THREE.Vector3, 0, 1, 0);
        let axisQuaternion = Helpers.NewQuaternion();
        axisQuaternion.setFromAxisAngle(axis, rotationShake);
        let newRot = this.originalRotation.clone().multiply(axisQuaternion);

        let newPos = this.originalPosition.clone().add(movementShake);
        this.body.body.setPosition(newPos);
        this.body.body.setRotation(newRot);
    }

    onUpdate(): void {
        this.applyShake();
    }

    shake(): void {
        this.isActive = true;
        this.startTime = GameplayScene.instance.memory.timeSinceStart;
    }
}
