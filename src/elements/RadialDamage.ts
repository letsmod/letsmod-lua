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
            if (hpElement && this.isContactCooldownExpired(other.body.id, now)) {
                const distanceFromCenter = other.body.getPosition().distanceTo(this.body.body.getPosition());
                let damage = this.calculateDamage(distanceFromCenter);
                if (this.isWithinDistance(distanceFromCenter)) {
                    hpElement.damage(damage, this.damageType, this.teamFlags);
                    this.contactCooldowns[other.body.id] = now;
                }
            }
        }
    }

    private isContactCooldownExpired(bodyId: number, now: number): boolean {
        return (
            this.contactCooldowns[bodyId] === undefined ||
            now - this.contactCooldowns[bodyId] >= this.cooldown
        );
    }

    private calculateDamage(distanceFromCenter: number): number {
        let damage = this.damageValue / distanceFromCenter;
        damage = Math.round(damage);
        if (this.distance === 999999 || damage > this.damageValue) {
            damage = this.damageValue;
        }
        return damage;
    }

    private isWithinDistance(distanceFromCenter: number): boolean {
        return distanceFromCenter <= this.distance;
    }
}
