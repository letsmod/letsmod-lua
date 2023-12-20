import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { HitPoints, DamageType } from "./HitPoints";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { Helpers } from "engine/Helpers";

export class ContactDamage extends LMent implements CollisionHandler {
    damageValue: number;
    damageType?: DamageType;
    teamFlags?: number;
    cooldown: number;
    contactDirection: Vector3;
    dotMinimum?: number;

    contactCooldowns: { [key: number]: number } = {};

    constructor(body: BodyHandle, id: number, params: Partial<ContactDamage> = {}) {
        super(body, id, params);
        this.damageValue = params.damageValue ?? 1;
        this.damageType = params.damageType;
        this.teamFlags = params.teamFlags;
        this.cooldown = params.cooldown ?? 0;
        this.contactDirection = params.contactDirection ?? Helpers.upVector;
        this.dotMinimum = params.dotMinimum;
    }

    onInit() {
        GameplayScene.instance.dispatcher.addListener("collision", this);
        this.contactDirection = Helpers.NewVector3(this.contactDirection.x, this.contactDirection.y, this.contactDirection.z);
    }

    onStart() {
    }

    onCollision(info: CollisionInfo) {
        const other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other) {
            const now = GameplayScene.instance.memory.timeSinceStart;
            const hpElement = other.getElement(HitPoints);

            const collisionDirection = info.getDeltaVOther().normalize();
            const myDirection = this.contactDirection.clone().applyQuaternion(this.body.body.getRotation()).normalize();
            const dotProduct = collisionDirection.dot(myDirection);

            if (this.dotMinimum === undefined || dotProduct >= this.dotMinimum) {
                if (hpElement && (this.contactCooldowns[other.body.id] === undefined || now - this.contactCooldowns[other.body.id] >= this.cooldown)) {
                    hpElement.damage(this.damageValue, this.damageType, this.teamFlags);
                    this.contactCooldowns[other.body.id] = now;
                }
            }
        }
    }
}
