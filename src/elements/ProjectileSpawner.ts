import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { global, js_new } from "js";
import { GameplayScene } from "engine/GameplayScene";

export class ProjectileSpawner extends LMent implements UpdateHandler {
    prefabName: string;
    spawnOffset: Vector3;
    initialVelocity: Vector3;
    spreadAngle: number;
    speedRandomFactor: number;
    projectilePrefab: BodyHandle | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<ProjectileSpawner> = {}) {
        super(body, id, params);

        this.prefabName = params.prefabName === undefined ? "Rock Projectile" : params.prefabName;
        this.spawnOffset = params.spawnOffset === undefined ? js_new(global.THREE.Vector3, 0, 0, 1) : params.spawnOffset;
        this.initialVelocity = params.initialVelocity === undefined ? js_new(global.THREE.Vector3, 0, 1, 10) : params.initialVelocity;
        this.spreadAngle = params.spreadAngle === undefined ? 5 : params.spreadAngle;
        this.speedRandomFactor = params.speedRandomFactor === undefined ? 0.1 : params.speedRandomFactor;
    }

    onInit(): void {
        this.projectilePrefab = GameplayScene.instance.clonePrefab(this.prefabName);
    }

    onStart(): void {
        this.spawnProjectile();
    }

    onUpdate(): void {

    }

    spawnProjectile(): void {

        let projectile = GameplayScene.instance.clonePrefab(this.prefabName);
        if (projectile !== undefined) {
            let position = this.body.body.getPosition().clone().add(this.spawnOffset);
            projectile.body.setPosition(position);
            //let random = Math.random()*this.spreadAngle;
            let spread = js_new(global.THREE.Vector3,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 0).multiplyScalar(this.spreadAngle);
            let velocity = this.initialVelocity.clone().add(spread).applyQuaternion(this.body.body.getRotation());
            let speedFactor = 1 + (Math.random() - 0.5) * 2 * this.speedRandomFactor;
            velocity.multiplyScalar(speedFactor);
            
            projectile.body.setVelocity(velocity);

            console.log("Spawned projectile at " + position.x + ", " + position.y + ", " + position.z + " with velocity " + velocity.x + ", " + velocity.y + ", " + velocity.z);
            return;
        }

    }
}