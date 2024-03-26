import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class SetEnabledOnCollision extends LMent implements CollisionHandler {
    elementName: string;
    collisionMinImpulse?: number;
    collisionMaxImpulse?: number;
    collisionMinDeltaV?: number;
    collisionMaxDeltaV?: number;
    elementChipName: string;
    setEnabled: boolean;
    dotMinimum?: number;
    contactDirection: Vector3;

    constructor(body: BodyHandle, id: number, params: Partial<SetEnabledOnCollision> = {}) {
        super(body, id, params);
        this.elementName = params.elementName ?? "";
        this.elementChipName = params.elementChipName ?? "";
        this.collisionMinDeltaV = params.collisionMinDeltaV;
        this.collisionMaxDeltaV = params.collisionMaxDeltaV;
        this.collisionMinImpulse = params.collisionMinImpulse;
        this.collisionMaxImpulse = params.collisionMaxImpulse;
        this.setEnabled = params.setEnabled ?? true;
        this.contactDirection = params.contactDirection ?? Helpers.upVector;
        this.dotMinimum = params.dotMinimum;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
        this.contactDirection = Helpers.ParamToVec3(this.contactDirection);
    }

    onStart(): void {
        // Add implementation here
    }

    onCollision(info: CollisionInfo): void {
        const impulseSufficient = this.collisionMinImpulse === undefined || info.getImpulse().length() >= this.collisionMinImpulse;
        const impulseNotExceeding = this.collisionMaxImpulse === undefined || info.getImpulse().length() <= this.collisionMaxImpulse;
        const deltaVSufficient = this.collisionMinDeltaV === undefined || info.getDeltaVOther().length() >= this.collisionMinDeltaV;
        const deltaVNotExceeding = this.collisionMaxDeltaV === undefined || info.getDeltaVOther().length() <= this.collisionMaxDeltaV;
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        let inBodyGroup = false;
        for (let i of this.body.bodyGroup) {
            if (other !== undefined && i == other)
            inBodyGroup = true;
    }
    if (!inBodyGroup && other && other.body.getPhysicsBodyType() !== 2) {// && other.body.getPhysicsBodyType() !== 1 why do we check for this?
        let collisionDirection = info.getImpulse().normalize();
        let adjustedContactDirection = this.contactDirection.clone().applyQuaternion(this.body.body.getRotation());
        
        let dotProduct = collisionDirection.dot(adjustedContactDirection);
        if (this.dotMinimum === undefined || dotProduct >= this.dotMinimum) {
            if (impulseSufficient && deltaVSufficient && deltaVNotExceeding && impulseNotExceeding || this.body.body.getPhysicsBodyType() === 2) {
                    console.log( info.getImpulse().length());
                    console.log(this.collisionMaxImpulse);
                    let elements = this.body.getAllElementsByTypeName(this.elementName);
                    for (let i = 0; i < elements.length; i++) {
                        if (elements[i].name === this.elementChipName || this.elementChipName === ""){
                            elements[i].enabled = this.setEnabled;
                        }
                    }
                }
            }
        }
    }
}
