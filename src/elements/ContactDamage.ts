import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { HitPoints, DamageType } from "./HitPoints";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { Helpers } from "engine/Helpers";

export class ContactDamage extends LMent implements CollisionHandler {
    damageValue: number;
    damageType: DamageType | undefined;
    teamFlags: number | undefined;
    cooldown: number;
    contactDirection: Vector3;
    dotMinimum: number | undefined;

    contactCooldowns: { [key: number]: number };

    constructor(body: BodyHandle, id: number, params: Partial<ContactDamage> = {}) {
        super(body, id, params);
        this.damageValue = params.damageValue === undefined ? 1 : params.damageValue;
        this.damageType = params.damageType;
        this.teamFlags = params.teamFlags;
        this.cooldown = params.cooldown === undefined ? 0 : params.cooldown;
        this.contactDirection = params.contactDirection === undefined ? Helpers.upVector : params.contactDirection;
        this.dotMinimum = params.dotMinimum;
        this.contactCooldowns = {};
    }

    onInit() {
        GameplayScene.instance.dispatcher.addListener("collision", this);
        this.contactDirection = Helpers.NewVector3(this.contactDirection.x, this.contactDirection.y, this.contactDirection.z);
    }

    onStart() {
    }

    onCollision(info: CollisionInfo) {
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other !== undefined) {
            const now = GameplayScene.instance.memory.timeSinceStart;
            const hpElement = other.getElement(HitPoints);

            let collisionDirection = info.getDeltaVOther().normalize();
            let myDirection = this.contactDirection.applyQuaternion(this.body.body.getRotation()).normalize();
            let dotProduct = collisionDirection.dot(myDirection);

            if (this.dotMinimum === undefined) {
                if (hpElement !== undefined) {
                    if (this.contactCooldowns[other.body.id] === undefined || now - this.contactCooldowns[other.body.id] >= this.cooldown) {
                        hpElement.damage(this.damageValue, this.damageType, this.teamFlags);
                        this.contactCooldowns[other.body.id] = now;
                    }
                }
            } else if (dotProduct >= this.dotMinimum) {
                if (hpElement !== undefined) {
                    if (this.contactCooldowns[other.body.id] === undefined || now - this.contactCooldowns[other.body.id] >= this.cooldown) {
                        hpElement.damage(this.damageValue, this.damageType, this.teamFlags);
                        this.contactCooldowns[other.body.id] = now;
                    }
                }
            }
        }
    }
}
