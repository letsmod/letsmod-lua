import { BodyHandle } from "..";
import { GameplayScene } from "../engine/GameplayScene";
import { CollisionInfo } from "../engine/MessageHandlers";
import { ContactDamage } from "./ContactDamage";
import { HitPoints } from "./HitPoints";

export class ForceDamage extends ContactDamage {
    velocityMin: number;

    constructor(body: BodyHandle, id: number, params: Partial<ForceDamage> = {}) {
        super(body, id, params);
        this.velocityMin = params.velocityMin === undefined ? 5 : params.velocityMin;
    }
    
    // TODO: Needs refactoring to correctly inherit the ContactDamage --> Anas.
    onCollision(info: CollisionInfo) {
        const other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other !== undefined) {
            const now = GameplayScene.instance.memory.timeSinceStart;
            const hpElement = other.getElement(HitPoints);
            const impactForce = info.getDeltaVRelative().length();
            if (impactForce >= this.velocityMin && hpElement !== undefined) {
                if (this.contactCooldowns[other.body.id] === undefined || now - this.contactCooldowns[other.body.id] >= this.cooldown) {
                    hpElement.damage(this.damageValue, this.damageType, this.teamFlags);
                    this.contactCooldowns[other.body.id] = now;
                }
            }
        }
    }
}
