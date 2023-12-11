import { BodyHandle } from "../engine/BodyHandle";
import { GameplayScene } from "../engine/GameplayScene";
import { HitPoints, DamageType } from "./HitPoints";
import { LMent } from "../engine/LMent";
import { CollisionHandler, CollisionInfo } from "../engine/MessageHandlers";

export class RadialDamage extends LMent implements CollisionHandler {
    damageValue: number;
    distance: number;
    damageType?: DamageType;
    teamFlags?: number;
    cooldown: number;
    private contactCooldowns: { [key: number]: number } = {};

    constructor(body: BodyHandle, id: number, params: Partial<RadialDamage> = {}) {
        super(body, id, params);
        this.damageValue = params.damageValue ?? 1;
        this.distance = params.distance ?? 999999;
        this.damageType = params.damageType;
        this.teamFlags = params.teamFlags;
        this.cooldown = params.cooldown ?? 0;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
    }

    onStart(): void {}

    onCollision(info: CollisionInfo): void {
        const other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other) {
            const now = GameplayScene.instance.memory.timeSinceStart;
            const hpElement = other.getElement(HitPoints);
            if (hpElement) {
                if (
                    this.contactCooldowns[other.body.id] === undefined ||
                    now - this.contactCooldowns[other.body.id] >= this.cooldown
                ) {
                    const distanceFromCenter = other.body.getPosition().distanceTo(this.body.body.getPosition());
                    let damage = this.damageValue / distanceFromCenter;
                    damage = Math.round(damage);
                    if (this.distance === 999999 || damage > this.damageValue) {
                        damage = this.damageValue;
                    }
                    if (distanceFromCenter <= this.distance) {
                        hpElement.damage(damage, this.damageType, this.teamFlags);
                        this.contactCooldowns[other.body.id] = now;
                    }
                }
            }
        }
    }
}
