import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { global, js_new } from "js";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class PrefabSpawner extends LMent implements TriggerHandler {
    triggerId: string;
    prefabName: string;
    spawnOffset: Vector3;
    initialVelocity: Vector3;
    spreadAngle: number;
    speedRandomFactor: number;

    constructor(body: BodyHandle, id: number, params: Partial<PrefabSpawner> = {}) {
        super(body, id, params);

        this.prefabName = params.prefabName === undefined ? Helpers.NA : params.prefabName;
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.spawnOffset = params.spawnOffset === undefined ? Helpers.forwardVector : params.spawnOffset;
        this.initialVelocity = params.initialVelocity === undefined ? Helpers.NewVector3(0, 1, 10) : params.initialVelocity;
        this.spreadAngle = params.spreadAngle === undefined ? 5 : params.spreadAngle;
        this.speedRandomFactor = params.speedRandomFactor === undefined ? 0.1 : params.speedRandomFactor;
    }

    validateElement() {
        return Helpers.ValidateParams(this.triggerId,this,"triggerId") && Helpers.ValidateParams(this.prefabName,this,"prefabName");
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("trigger", this);
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
        this.spawn();
    }

    spawn(): void {
        let projectile = GameplayScene.instance.clonePrefab(this.prefabName);
        if (projectile === undefined)
        {
            console.log("No prefab named: "+this.prefabName+" exists in the library.");
            return;
        }
        
        let position = this.body.body.getPosition().clone().add(this.spawnOffset);
        projectile.body.setPosition(position);
        let spread = js_new(global.THREE.Vector3,
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