import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class ContactForce extends LMent implements CollisionHandler {
    forceValue: number;
    scaleWithMass: boolean;
    forceDirection: Vector3;
    dotMinimum: number | undefined;
    cooldown: number; // Cooldown duration
    forceCooldowns: { [key: number]: number }; // Map for cooldowns
    maxSpeed: number;

    constructor(body: BodyHandle, id: number, params: Partial<ContactForce> = {}) {
        super(body, id, params);
        this.forceValue = params.forceValue === undefined ? 1 : params.forceValue;
        this.scaleWithMass = params.scaleWithMass === undefined ? false : params.scaleWithMass;
        this.forceDirection = params.forceDirection === undefined ? Helpers.NewVector3(1, 0, 0) : params.forceDirection;
        this.dotMinimum = params.dotMinimum;
        this.cooldown = params.cooldown === undefined ? 0 : params.cooldown; // Default cooldown duration
        this.forceCooldowns = {}; // Initialize the cooldown map
        this.maxSpeed = params.maxSpeed === undefined ? 40 : params.maxSpeed;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
    }

    onStart(): void {
        this.forceDirection = Helpers.NewVector3(this.forceDirection.x, this.forceDirection.y, this.forceDirection.z);
    }

    onCollision(info: CollisionInfo): void {
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other !== undefined) {
            if (other.body.getPhysicsBodyType() !== 0 && other.body.getPhysicsBodyType() !== undefined) {
                return;
            }
            const now = GameplayScene.instance.memory.timeSinceStart;

            // Check if cooldown has passed for this object
            if (this.forceCooldowns[other.body.id] === undefined || now - this.forceCooldowns[other.body.id] >= this.cooldown) {
                let currentSpeed = other.body.getVelocity().length();
                let speedFactor = 1 - Math.min(currentSpeed / this.maxSpeed, 1);
                //console.log(speedFactor);
                let collisionDirection = info.getDeltaVOther().normalize();
                let objectRotation = this.body.body.getRotation();

                // Adjust force direction based on object's rotation
                let adjustedForceDirection = this.forceDirection.clone().applyQuaternion(objectRotation).normalize();
                let dotProduct = collisionDirection.dot(adjustedForceDirection);

                if (this.dotMinimum === undefined || dotProduct >= this.dotMinimum) {
                    let forceMagnitude = this.forceValue * speedFactor;
                    let forceToApply = adjustedForceDirection.multiplyScalar(forceMagnitude);

                    if (this.scaleWithMass) {
                        let mass = other.body.getMass();
                        forceToApply.multiplyScalar(mass);
                    }

                    other.body.applyCentralForce(forceToApply);

                    // Update the last force application time for this object
                    this.forceCooldowns[other.body.id] = now;
                }
            }
        }
    }
}
