import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { AbstractGadget } from "./AbstractGadget";
import { Vector3 } from "three";
import { DamageTeam, HitPoints } from "../HitPoints";
import { SpecialGadget } from "./SpecialGadget";
import { ScaleWaypoint } from "elements/ScaleWaypoint";

export class LauncherGadget extends SpecialGadget {
  launchSpeedHorizontal : number;
  launchSpeedVertical : number;
  autoAimMinDotProduct : number;
  prefabName : string;
  spawnOffset : Vector3;
  gravityConstant : number;
  smallMuzzleEffect: ScaleWaypoint | undefined;
  bigMuzzleEffect: ScaleWaypoint | undefined;

  constructor(body: BodyHandle, id: number, params: Partial<LauncherGadget> = {})
  {
    super(body, id, params);
    this.launchSpeedHorizontal = params.launchSpeedHorizontal ?? 18;
    this.launchSpeedVertical = params.launchSpeedVertical ?? 2;
    this.autoAimMinDotProduct = params.autoAimMinDotProduct ?? 0.85;
    this.gravityConstant = params.gravityConstant ?? -9.81 * 2.5;
    this.prefabName = params.prefabName ?? "StoneProjectile_Lua";
    this.spawnOffset = params.spawnOffset ?
      Helpers.NewVector3(params.spawnOffset.x, params.spawnOffset.y, params.spawnOffset.z)
      : Helpers.NewVector3(0, 0, 0.5);
  }

  onInit(): void {
    super.onInit();
  }

  onStart(): void {
    super.onStart();
    const smallMuzzleEffectBody = this.body.bodyGroup.find((b) => b.body.name === "MuzzleEffect");
    const bigMuzzleEffectBody = this.body.bodyGroup.find((b) => b.body.name === "BigMuzzleEffect");
    this.smallMuzzleEffect = smallMuzzleEffectBody?.getElement(ScaleWaypoint);
    this.bigMuzzleEffect = bigMuzzleEffectBody?.getElement(ScaleWaypoint);
  }

  onUpdate(dt: number): void {
    super.onUpdate(dt);
  }

  doActivate() {
    let playerBody = GameplayScene.instance.memory.player;
    if (playerBody)
    {
      let direction = Helpers.forwardVector.applyQuaternion(playerBody.body.getRotation());

      let projectile = GameplayScene.instance.clonePrefab(this.prefabName);
      if (projectile === undefined) {
          console.log("No prefab named: " + this.prefabName + " exists in the library.");
          return undefined;
      }

      let offset = this.spawnOffset.clone().applyQuaternion(playerBody.body.getRotation());

      let position = this.body.body.getPosition().clone().add(offset);
      projectile.body.setPosition(position);

      let closestTargetScore = Infinity;
      let closestTarget : BodyHandle | undefined = undefined;

      let hpElements = GameplayScene.instance.findAllElements(HitPoints);
      for (let hp of hpElements)
      {
        if (hp.team !== DamageTeam.player && hp.body !== this.body)
        {
          let delta = hp.body.body.getPosition().clone().sub(this.body.body.getPosition());
          let distance = delta.length();
          if (distance < this.launchSpeedHorizontal)
          {
            let dot = delta.setY(0).normalize().dot(direction);
            if (dot >= this.autoAimMinDotProduct)
            {
              let score = distance;
              if (score < closestTargetScore)
              {
                closestTargetScore = score;
                closestTarget = hp.body;
              }  
            }
          }
        }
      }

      if (closestTarget)
      {
        let targetPosition = closestTarget.body.getPosition();
        let projectilePosition = projectile.body.getPosition();

        let delta = targetPosition.clone().sub(projectilePosition);
        direction.copy(delta).normalize().multiplyScalar(this.launchSpeedHorizontal);

        let timeToTarget = delta.length() / this.launchSpeedHorizontal;

        direction.y += -0.5 * this.gravityConstant * timeToTarget;
        
        if (direction.y > this.launchSpeedVertical)
        {
          direction.y = this.launchSpeedVertical;
        }
      }
      else
      {
        direction.multiplyScalar(this.launchSpeedHorizontal);
        direction.y = this.launchSpeedVertical;
      }

      this.smallMuzzleEffect?.startOver();
      this.bigMuzzleEffect?.startOver();
      projectile.body.setVelocity(direction);
      playerBody.body.applyCentralForce(Helpers.forwardVector.multiplyScalar(-1).add(Helpers.upVector).applyQuaternion(playerBody.body.getRotation()).multiplyScalar(200));
      return direction.setY(0).normalize();
    }
    return undefined;
  }
}