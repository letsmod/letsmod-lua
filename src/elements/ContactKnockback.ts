import { BodyHandle } from "engine/BodyHandle";
import { CollisionInfo } from "engine/MessageHandlers";
import { GameplayScene } from "engine/GameplayScene";
import { Vector3 } from "three";
import { ContactForce } from "./ContactForce";


export class ContactKnockback extends ContactForce {
    constructor(body: BodyHandle, id: number, params = {}) {
        super(body, id, params);
    }

    onCollision(info: CollisionInfo): void {
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other !== undefined) {
            
            let collisionNormal = info.getDeltaVOther();
            let forceMagnitude = this.forceValue;
            
            let forceToApply = collisionNormal.clone().multiplyScalar(forceMagnitude);

            if (this.scaleWithMass) {
                let mass = other.body.getMass();
                forceToApply.multiplyScalar(mass);
            }
            
            other.body.applyCentralForce(forceToApply);
            
        }
    }
}