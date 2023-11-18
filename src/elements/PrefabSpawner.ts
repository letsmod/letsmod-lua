import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class PrefabSpawner extends LMent implements TriggerHandler {
    triggerId: string;
    prefabName: string;
    spawnOffset: Vector3;
    initialVelocity: Vector3;
    spreadAngle: number;
    speedRandomFactor: number;
    cooldown: number;
    private lastSpawnTime: number;

    constructor(body: BodyHandle, id: number, params: Partial<PrefabSpawner> = {}) {
        super(body, id, params);

        this.prefabName = params.prefabName === undefined ? Helpers.NA : params.prefabName;
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.spawnOffset = params.spawnOffset === undefined ? Helpers.forwardVector : params.spawnOffset;
        this.initialVelocity = params.initialVelocity === undefined ? Helpers.NewVector3(0, 1, 10) : params.initialVelocity;
        this.spreadAngle = params.spreadAngle === undefined ? 5 : params.spreadAngle;
        this.speedRandomFactor = params.speedRandomFactor === undefined ? 0.1 : params.speedRandomFactor;
        this.cooldown = params.cooldown === undefined ? 0.3 : params.cooldown;
        this.lastSpawnTime = 0;
    }

    validateElement() {
        return Helpers.ValidateParams(this.triggerId, this, "triggerId") && Helpers.ValidateParams(this.prefabName, this, "prefabName");
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("trigger", this);
        this.initialVelocity = Helpers.NewVector3(this.initialVelocity.x, this.initialVelocity.y, this.initialVelocity.z);
        this.enabled = this.validateElement();
    }

    onStart(): void {

    }

    hasSubtype(trigger: string): boolean {
        return trigger == this.triggerId
    }

    onTrigger(source: LMent, triggerId: string): void {
        if (!this.validateElement())
            return;
        let now = GameplayScene.instance.memory.timeSinceStart;
        if (now - this.lastSpawnTime >= this.cooldown) {
            this.spawn();
            this.lastSpawnTime = now;
        }
    }

    spawn(): void {
        //let projectile = GameplayScene.instance.clonePrefab(this.prefabName);
        let projectile = undefined;
        for (let i = 0; i < GameplayScene.instance.bodies.length; i++)
            if (GameplayScene.instance.bodies[i].body.name == this.prefabName)
                projectile = GameplayScene.instance.bodies[i].body.cloneBody();
        if (projectile === undefined) {
            console.log("No prefab named: " + this.prefabName + " exists in the library.");
            return;
        }

        let offset = this.spawnOffset.clone().applyQuaternion(this.body.body.getRotation());

        let position = this.body.body.getPosition().clone().add(offset);
        projectile.body.setPosition(position);
        let spread = Helpers.NewVector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 0).multiplyScalar(this.spreadAngle);
        let velocity = this.initialVelocity.clone().add(spread).applyQuaternion(this.body.body.getRotation());
        let speedFactor = 1 + (Math.random() - 0.5) * 2 * this.speedRandomFactor;
        velocity.multiplyScalar(speedFactor);
        projectile.body.setVelocity(velocity);
        return;
    }


}