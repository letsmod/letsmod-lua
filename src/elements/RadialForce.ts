import { Helpers } from "engine/Helpers";
import { BodyHandle } from "../engine/BodyHandle";
import { GameplayScene } from "../engine/GameplayScene";
import { LMent } from "../engine/LMent";
import { CollisionHandler, CollisionInfo } from "../engine/MessageHandlers";

export class RadialForce extends LMent implements CollisionHandler {
    forceValue: number;

    constructor(body: BodyHandle, id: number, params: Partial<RadialForce> = {}) {
        super(body, id, params);
        this.forceValue = params.forceValue === undefined ? 1 : params.forceValue;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
    }

    onStart(): void {
    }

    onCollision(info: CollisionInfo): void {
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other !== undefined) {
            let directionFromCenter = Helpers.NewVector3(0, 0, 0).subVectors(other.body.getPosition(), this.body.body.getPosition()).normalize();
            let distanceFromCenter = other.body.getPosition().distanceTo(this.body.body.getPosition());
            let forceMagnitude = this.forceValue / distanceFromCenter;
            if (forceMagnitude > this.forceValue) {
                forceMagnitude = this.forceValue;
            }
            other.body.applyCentralForce(directionFromCenter.multiplyScalar(forceMagnitude));
        }
    }

}
