import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class SetEnabledOnCollision extends LMent implements CollisionHandler {
    elementName: string;
    collisionMinImpulse?: number;
    collisionMinDeltaV?: number;
    elementChipName: string;
    setEnabled: boolean;
    dotMinimum?: number;
    contactDirection: Vector3;

    constructor(body: BodyHandle, id: number, params: Partial<SetEnabledOnCollision> = {}) {
        super(body, id, params);
        this.elementName = params.elementName ?? "";
        this.elementChipName = params.elementChipName ?? "";
        this.collisionMinDeltaV = params.collisionMinDeltaV;
        this.collisionMinImpulse = params.collisionMinImpulse;
        this.setEnabled = params.setEnabled ?? true;
        this.contactDirection = params.contactDirection ?? Helpers.upVector;
        this.dotMinimum = params.dotMinimum;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
    }

    onStart(): void {
        // Add implementation here
    }

    onCollision(info: CollisionInfo): void {
        const impulseSufficient = this.collisionMinImpulse === undefined || info.getImpulse().length() >= this.collisionMinImpulse;
        const deltaVSufficient = this.collisionMinDeltaV === undefined || info.getDeltaVOther().length() >= this.collisionMinDeltaV;
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        let inBodyGroup = false;
        for (let i of this.body.bodyGroup) {
            if (other !== undefined && i == other)
                inBodyGroup = true;
        }
        if (!inBodyGroup && other && other.body.name !== "MainCamera_Lua" && other.body.getPhysicsBodyType() !== 2) {
            let collisionDirection = info.getDeltaVOther().normalize();
            let adjustedContactDirection = this.contactDirection.clone().applyQuaternion(this.body.body.getRotation());

            let dotProduct = collisionDirection.dot(adjustedContactDirection);
            if (this.dotMinimum === undefined || dotProduct >= this.dotMinimum) {
                if (impulseSufficient && deltaVSufficient || this.body.body.getPhysicsBodyType() === 2) {
                    let elements = this.body.getAllElementsByTypeName(this.elementName);
                    for (let i = 0; i < elements.length; i++) {
                        if (elements[i].name === this.elementChipName || this.elementChipName === "")
                            elements[i].enabled = this.setEnabled;
                    }
                }
            }
        }
    }
}
